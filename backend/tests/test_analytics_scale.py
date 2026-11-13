"""Comprehensive tests for analytics scale, AOV multi-line order calculation,
profit estimation tracking, upload security validation, and single-admin authorization.
"""

import io
import pytest
import pandas as pd
from app.analytics.sales_analytics import compute_sales_analytics
from app.analytics.ingestion import process_csv_content
from app.database.repository import dataset_repo
from app.services.analytics_service import AnalyticsService
from app.services.dataset_service import DatasetService
from app.core.config import settings


def test_aov_multiline_order_formula():
    """Verifies that Average Order Value = Total Revenue / Number of Unique Orders,
    not simply averaging raw line items when multiple rows belong to one order.
    """
    records = [
        # Order 1 (3 items): $20 + $30 + $50 = $100
        {"transaction_id": "ORD-101", "date": "2026-01-01 10:00:00", "total_amount": 20.0, "quantity": 1, "profit": 5.0},
        {"transaction_id": "ORD-101", "date": "2026-01-01 10:00:00", "total_amount": 30.0, "quantity": 1, "profit": 10.0},
        {"transaction_id": "ORD-101", "date": "2026-01-01 10:00:00", "total_amount": 50.0, "quantity": 2, "profit": 20.0},
        # Order 2 (1 item): $50
        {"transaction_id": "ORD-102", "date": "2026-01-01 11:00:00", "total_amount": 50.0, "quantity": 1, "profit": 15.0},
    ]

    res = compute_sales_analytics(records)
    summary = res["summary"]

    assert summary["total_revenue"] == 150.0
    assert summary["total_transactions"] == 4  # 4 line items
    assert summary["unique_orders"] == 2  # 2 actual orders

    # Expected AOV: $150 / 2 = $75.0 (Previously bugged mean was $150 / 4 = $37.5)
    assert summary["avg_order_value"] == 75.0
    # Expected units per order: 5 units / 2 orders = 2.5
    assert summary["avg_units_per_order"] == 2.5


def test_profit_actual_vs_estimated_distinction():
    """Verifies that explicit cost data is tagged as actual profit,
    while missing cost data is explicitly identified as estimated.
    """
    # 1. Dataset WITH explicit unit cost
    csv_with_cost = (
        "date,product,quantity,unit_price,unit_cost,total_amount\n"
        "2026-01-01,Product A,2,100.0,60.0,200.0\n"
        "2026-01-02,Product B,1,50.0,30.0,50.0\n"
    ).encode("utf-8")

    res_actual = process_csv_content(csv_with_cost, "cost_present.csv")
    financials_actual = res_actual["summary"]["financials"]
    assert financials_actual["cost_data_available"] is True
    assert financials_actual["profit_type"] == "actual"
    assert financials_actual["cost_disclaimer"] is None
    # Profit: (200 - 120) + (50 - 30) = 80 + 20 = 100
    assert financials_actual["total_profit"] == 100.0

    # 2. Dataset WITHOUT cost columns
    csv_without_cost = (
        "date,product,quantity,unit_price,total_amount\n"
        "2026-01-01,Product A,2,100.0,200.0\n"
    ).encode("utf-8")

    res_est = process_csv_content(csv_without_cost, "cost_absent.csv")
    financials_est = res_est["summary"]["financials"]
    assert financials_est["cost_data_available"] is False
    assert financials_est["profit_type"] == "estimated"
    assert financials_est["cost_disclaimer"] is not None
    assert "estimated" in financials_est["cost_disclaimer"].lower()


def test_scale_zero_truncation_500_records():
    """Critical test: Ingest a dataset with 500 records and verify that
    analytics calculations and CSV export process ALL 500 records,
    eliminating the previous 200-row pagination truncation bug.
    """
    rows = []
    for i in range(500):
        rows.append(f"2026-01-01,TX-{i},Prod-{i % 10},1,10.0,10.0")
    csv_str = "date,transaction_id,product_name,quantity,unit_price,total_amount\n" + "\n".join(rows)
    csv_bytes = csv_str.encode("utf-8")

    saved_doc = DatasetService.process_and_save_csv(csv_bytes, "scale_500.csv")
    dataset_id = saved_doc["dataset_id"]

    try:
        # 1. Verify repository all-records retrieval
        all_records = dataset_repo.get_all_dataset_records(dataset_id)
        assert len(all_records) == 500

        # 2. Verify Analytics Service processes all 500 rows (NOT capped at 200)
        sales_data = AnalyticsService.get_sales_analytics(dataset_id)
        assert sales_data["summary"]["total_transactions"] == 500
        assert sales_data["summary"]["total_revenue"] == 5000.0
        assert sales_data["summary"]["unique_orders"] == 500

        # 3. Verify CSV Export downloads all 500 rows (NOT capped at 200)
        exported_csv, _ = DatasetService.export_dataset_csv(dataset_id)
        exported_df = pd.read_csv(io.StringIO(exported_csv))
        assert len(exported_df) == 500

        # 4. Verify Data Explorer preview remains paginated at 25 rows
        preview = DatasetService.get_preview(dataset_id, page=1, page_size=25)
        assert len(preview["items"]) == 25
        assert preview["total_records"] == 500
        assert preview["total_pages"] == 20
    finally:
        # Cleanup
        dataset_repo.delete_dataset(dataset_id)


def test_upload_security_validations():
    """Verifies server-side CSV and Excel file validation rules."""
    # 1. Non-CSV/Excel extension rejected
    with pytest.raises(ValueError, match="Invalid file extension"):
        process_csv_content(b"test data", "malicious_script.sh")

    # 2. Empty file rejected
    with pytest.raises(ValueError, match="empty"):
        process_csv_content(b"", "empty.csv")

    # 3. Unrecognizable headers rejected
    with pytest.raises(ValueError, match="Could not identify recognizable retail transaction columns"):
        process_csv_content(b"col_a,col_b,col_c\n1,2,3\n", "unrecognized.csv")


def test_upload_excel_dataset():
    """Verifies dynamic ingestion of Excel (.xlsx) files."""
    df = pd.DataFrame({
        "Date": ["2026-02-01", "2026-02-02"],
        "Product Name": ["Organic Milk", "Sourdough Bread"],
        "Category": ["Dairy", "Bakery"],
        "Quantity": [2, 1],
        "Price": [4.50, 6.00],
        "Total": [9.00, 6.00],
    })
    excel_buffer = io.BytesIO()
    df.to_excel(excel_buffer, index=False, engine="openpyxl")
    excel_bytes = excel_buffer.getvalue()

    result = process_csv_content(excel_bytes, "grocery_inventory.xlsx")
    assert result["summary"]["clean_rows"] == 2
    assert result["summary"]["financials"]["total_revenue"] == 15.00
    assert len(result["records"]) == 2
    assert result["records"][0]["product_name"] == "Organic Milk"


