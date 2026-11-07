"""Tests for customer cohort analytics and geographic store mapping."""

import pytest
from starlette.testclient import TestClient


@pytest.fixture(scope="module")
def sample_clothing_id(client: TestClient) -> str:
    """Ensures sample clothing dataset exists and returns its ID."""
    resp = client.post("/api/datasets/sample/clothing")
    assert resp.status_code == 201
    return resp.json()["dataset"]["dataset_id"]


def test_customer_analytics(client: TestClient, sample_clothing_id: str) -> None:
    """Verify that customer analytics computes RFM cohorts, repeat rates, and demographics."""
    resp = client.get(f"/api/analytics/customers?dataset_id={sample_clothing_id}")
    assert resp.status_code == 200
    data = resp.json()

    assert data["dataset_id"] == sample_clothing_id
    summary = data["summary"]
    assert summary["total_customers"] > 0
    assert summary["avg_clv"] > 0
    assert summary["repeat_rate_pct"] >= 0

    # RFM Segments
    assert len(data["rfm_segments"]) > 0
    first_segment = data["rfm_segments"][0]
    assert "segment" in first_segment
    assert "customer_count" in first_segment
    assert "total_revenue" in first_segment
    assert "avg_spend" in first_segment

    # Demographics
    demographics = data["demographics"]
    assert "gender" in demographics
    assert "age_groups" in demographics

    # VIP Customers Leaderboard
    assert len(data["top_customers"]) > 0
    first_vip = data["top_customers"][0]
    assert "customer_id" in first_vip
    assert "total_spend" in first_vip
    assert "order_count" in first_vip
    assert "segment" in first_vip


def test_geographic_analytics(client: TestClient, sample_clothing_id: str) -> None:
    """Verify that geographic analytics computes store benchmarking and regional distributions."""
    resp = client.get(f"/api/analytics/geographic?dataset_id={sample_clothing_id}")
    assert resp.status_code == 200
    data = resp.json()

    assert data["dataset_id"] == sample_clothing_id
    summary = data["summary"]
    assert summary["total_stores"] > 0
    assert summary["total_regions"] > 0
    assert summary["avg_revenue_per_store"] > 0

    # Regions
    assert len(data["regions"]) > 0
    first_reg = data["regions"][0]
    assert "region" in first_reg
    assert "revenue" in first_reg
    assert "profit_margin_pct" in first_reg

    # Stores
    assert len(data["stores"]) > 0
    first_store = data["stores"][0]
    assert "store_name" in first_store
    assert "city" in first_store
    assert "performance_index" in first_store
    assert "avg_order_value" in first_store

    # Cities
    assert len(data["cities"]) > 0

