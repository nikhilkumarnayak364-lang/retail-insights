"""Tests for dataset ingestion, schema normalization, and management endpoints."""

import io
import pytest
from starlette.testclient import TestClient


def test_upload_standard_csv(client: TestClient) -> None:
    """Verify that uploading a standard retail CSV parses and computes metrics."""
    csv_content = (
        "Transaction ID,Date,Product Name,Category,Quantity,Unit Price,Discount,Payment Method,Store Name\n"
        "TRX-001,2026-01-10 10:30:00,Denim Jacket,Apparel,2,50.00,5.00,Credit Card,Main Store\n"
        "TRX-002,2026-01-10 11:15:00,Slim Chinos,Apparel,1,40.00,0.00,Debit Card,Main Store\n"
        "TRX-003,2026-01-11 14:20:00,Cotton T-Shirt,Apparel,3,20.00,0.00,Cash,Downtown Branch\n"
    )
    files = {"file": ("test_retail_sales.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    response = client.post("/api/datasets/upload", files=files)

    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert "dataset" in data

    ds = data["dataset"]
    assert ds["row_count"] == 3
    assert ds["retail_type"] == "clothing"
    assert ds["filename"] == "test_retail_sales.csv"
    assert "financials" in ds["summary_stats"]
    assert ds["summary_stats"]["financials"]["total_units_sold"] == 6
    # Revenue: (2*50 - 5 = 95) + (1*40 = 40) + (3*20 = 60) = 195.00
    assert ds["summary_stats"]["financials"]["total_revenue"] == 195.00


def test_upload_synonym_csv(client: TestClient) -> None:
    """Verify that flexible column synonym mapping correctly normalizes arbitrary retail headers."""
    csv_content = (
        "Order ID,Purchase Date,Item Title,Department,Units,Rate,Markdown,Tender Type,Location\n"
        "ORD-991,2026-02-01 12:00:00,Organic Bananas 1kg,Produce,4,2.50,1.00,EBT,Supermarket West\n"
        "ORD-992,2026-02-01 13:40:00,Whole Milk 1 Gallon,Dairy,2,3.50,0.00,Cash,Supermarket West\n"
    )
    files = {"file": ("grocery_test.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    response = client.post("/api/datasets/upload", files=files)

    assert response.status_code == 201
    data = response.json()["dataset"]
    assert data["row_count"] == 2
    assert data["retail_type"] == "grocery"

    # Verify column mapping was stored
    mapping = data["schema_mapping"]
    assert mapping["Order ID"] == "transaction_id"
    assert mapping["Purchase Date"] == "date"
    assert mapping["Item Title"] == "product_name"
    assert mapping["Department"] == "category"
    assert mapping["Units"] == "quantity"
    assert mapping["Rate"] == "unit_price"


def test_load_sample_datasets(client: TestClient) -> None:
    """Verify loading sample datasets for clothing, grocery, and electronics."""
    for vertical in ["clothing", "grocery", "electronics"]:
        response = client.post(f"/api/datasets/sample/{vertical}")
        assert response.status_code == 201
        data = response.json()["dataset"]
        assert data["row_count"] >= 100
        assert data["retail_type"] == vertical


def test_list_and_activate_datasets(client: TestClient) -> None:
    """Verify dataset listing, active flag switching, and retrieval."""
    list_resp = client.get("/api/datasets")
    assert list_resp.status_code == 200
    list_data = list_resp.json()
    assert list_data["total_datasets"] > 0
    assert len(list_data["datasets"]) > 0

    first_ds_id = list_data["datasets"][0]["dataset_id"]

    # Activate
    act_resp = client.post(f"/api/datasets/{first_ds_id}/activate")
    assert act_resp.status_code == 200

    # Verify active
    active_resp = client.get("/api/datasets/active")
    assert active_resp.status_code == 200
    assert active_resp.json()["dataset_id"] == first_ds_id


def test_preview_dataset_pagination(client: TestClient) -> None:
    """Verify preview endpoint returns paginated transaction records."""
    list_data = client.get("/api/datasets").json()
    ds_id = list_data["datasets"][0]["dataset_id"]

    preview_resp = client.get(f"/api/datasets/{ds_id}/preview?page=1&page_size=10")
    assert preview_resp.status_code == 200
    preview_data = preview_resp.json()

    assert preview_data["dataset_id"] == ds_id
    assert preview_data["page"] == 1
    assert preview_data["page_size"] == 10
    assert len(preview_data["items"]) <= 10
    assert "transaction_id" in preview_data["items"][0]
    assert "total_amount" in preview_data["items"][0]


def test_delete_dataset(client: TestClient) -> None:
    """Verify that deleting a dataset removes it completely."""
    # First upload temporary dataset
    csv_content = "Date,Product,Quantity,Price\n2026-03-01,Temporary Item,1,10.0\n"
    files = {"file": ("temp_to_delete.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    upload_resp = client.post("/api/datasets/upload", files=files)
    temp_id = upload_resp.json()["dataset"]["dataset_id"]

    # Delete
    del_resp = client.delete(f"/api/datasets/{temp_id}")
    assert del_resp.status_code == 200
    assert del_resp.json()["success"] is True

    # Confirm 404
    get_resp = client.get(f"/api/datasets/{temp_id}")
    assert get_resp.status_code == 404

