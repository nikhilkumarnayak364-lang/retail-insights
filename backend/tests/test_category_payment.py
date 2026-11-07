"""Tests for category hierarchy analytics and payment economics."""

import pytest
from starlette.testclient import TestClient


@pytest.fixture(scope="module")
def sample_clothing_id(client: TestClient) -> str:
    """Ensures sample clothing dataset exists and returns its ID."""
    resp = client.post("/api/datasets/sample/clothing")
    assert resp.status_code == 201
    return resp.json()["dataset"]["dataset_id"]


def test_category_analytics(client: TestClient, sample_clothing_id: str) -> None:
    """Verify that category analytics computes hierarchy, margins, and subcategories."""
    resp = client.get(f"/api/analytics/categories?dataset_id={sample_clothing_id}")
    assert resp.status_code == 200
    data = resp.json()

    assert data["dataset_id"] == sample_clothing_id
    summary = data["summary"]
    assert summary["total_categories"] > 0
    assert summary["total_subcategories"] > 0
    assert summary["top_category_revenue"] != "N/A"
    assert summary["avg_category_margin_pct"] >= 0

    assert len(data["categories"]) > 0
    cat = data["categories"][0]
    assert "category" in cat
    assert "revenue" in cat
    assert "profit" in cat
    assert "sku_count" in cat
    assert "profit_margin_pct" in cat
    assert "revenue_share_pct" in cat
    assert isinstance(cat["subcategories"], list)


def test_payment_analytics(client: TestClient, sample_clothing_id: str) -> None:
    """Verify that payment analytics computes tender breakdown, fee estimation, and digital adoption."""
    resp = client.get(f"/api/analytics/payments?dataset_id={sample_clothing_id}")
    assert resp.status_code == 200
    data = resp.json()

    assert data["dataset_id"] == sample_clothing_id
    summary = data["summary"]
    assert summary["total_payment_methods"] > 0
    assert summary["dominant_method"] != "N/A"
    assert summary["dominant_method_share_pct"] > 0
    assert summary["digital_adoption_pct"] >= 0
    assert summary["avg_ticket_overall"] > 0
    assert summary["total_estimated_processing_fees"] >= 0

    assert len(data["methods"]) > 0
    method = data["methods"][0]
    assert "method" in method
    assert "revenue" in method
    assert "transactions" in method
    assert "revenue_share_pct" in method
    assert "avg_ticket" in method
    assert "estimated_fee" in method

