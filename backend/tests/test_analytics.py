"""Tests for sales and product analytics engines."""

import io
import pytest
from starlette.testclient import TestClient


@pytest.fixture(scope="module")
def sample_dataset_id(client: TestClient) -> str:
    """Ensures a realistic clothing dataset exists and returns its ID."""
    resp = client.post("/api/datasets/sample/clothing")
    assert resp.status_code == 201
    return resp.json()["dataset"]["dataset_id"]


def test_sales_analytics(client: TestClient, sample_dataset_id: str) -> None:
    """Verify that sales analytics calculates revenue, time-series, and temporal patterns."""
    resp = client.get(f"/api/analytics/sales?dataset_id={sample_dataset_id}")
    assert resp.status_code == 200
    data = resp.json()

    assert data["dataset_id"] == sample_dataset_id
    assert "summary" in data
    summary = data["summary"]
    assert summary["total_revenue"] > 0
    assert summary["total_units_sold"] > 0
    assert summary["total_transactions"] >= 100
    assert summary["avg_order_value"] > 0
    assert summary["profit_margin_pct"] > 0

    # Timeline points
    assert len(data["timeline"]) > 0
    first_pt = data["timeline"][0]
    assert "date" in first_pt
    assert "revenue" in first_pt
    assert "profit" in first_pt
    assert "cumulative_revenue" in first_pt

    # Day of Week
    assert len(data["day_of_week"]) == 7
    days = [d["day"] for d in data["day_of_week"]]
    assert "Monday" in days
    assert "Friday" in days

    # Hour of Day
    assert len(data["hour_of_day"]) == 24

    # Payment Methods
    assert len(data["payment_methods"]) > 0
    assert "method" in data["payment_methods"][0]
    assert "revenue" in data["payment_methods"][0]
    assert "share_pct" in data["payment_methods"][0]

    # Velocity
    assert data["velocity"]["daily_run_rate"] > 0
    assert data["velocity"]["operating_days"] > 0


def test_product_analytics(client: TestClient, sample_dataset_id: str) -> None:
    """Verify product analytics computes best-sellers, categories, and price tiers."""
    resp = client.get(f"/api/analytics/products?dataset_id={sample_dataset_id}&limit=5")
    assert resp.status_code == 200
    data = resp.json()

    assert data["dataset_id"] == sample_dataset_id
    catalog = data["catalog_summary"]
    assert catalog["total_skus"] > 0
    assert catalog["total_categories"] > 0
    assert catalog["avg_price_point"] > 0
    assert catalog["overall_margin_pct"] > 0

    # Top by revenue
    assert len(data["top_by_revenue"]) <= 5
    top_p = data["top_by_revenue"][0]
    assert "product_name" in top_p
    assert "revenue" in top_p
    assert "units_sold" in top_p
    assert "profit_margin_pct" in top_p

    # Categories
    assert len(data["categories"]) > 0
    first_cat = data["categories"][0]
    assert "category" in first_cat
    assert "revenue" in first_cat
    assert "profit_margin_pct" in first_cat

    # Price Tiers
    assert len(data["price_tiers"]) == 5


def test_analytics_active_fallback(client: TestClient, sample_dataset_id: str) -> None:
    """Verify that omitting dataset_id falls back to the currently active dataset."""
    client.post(f"/api/datasets/{sample_dataset_id}/activate")
    resp = client.get("/api/analytics/sales")
    assert resp.status_code == 200
    assert resp.json()["dataset_id"] == sample_dataset_id

