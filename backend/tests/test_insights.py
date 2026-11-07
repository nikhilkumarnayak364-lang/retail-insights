"""Tests for automated business insights, health scores, and prescriptive recommendations."""

import pytest
from starlette.testclient import TestClient


@pytest.fixture(scope="module")
def sample_clothing_id(client: TestClient) -> str:
    """Ensures sample clothing dataset exists and returns its ID."""
    resp = client.post("/api/datasets/sample/clothing")
    assert resp.status_code == 201
    return resp.json()["dataset"]["dataset_id"]


def test_business_insights(client: TestClient, sample_clothing_id: str) -> None:
    """Verify that automated business insights generates a health score, breakdowns, and actionable recommendations."""
    resp = client.get(f"/api/analytics/insights?dataset_id={sample_clothing_id}")
    assert resp.status_code == 200
    data = resp.json()

    assert data["dataset_id"] == sample_clothing_id
    assert "health_score" in data
    health = data["health_score"]
    assert 0 <= health["overall_score"] <= 100
    assert health["grade"] in ["A+", "A", "B", "C", "Needs Attention"]
    assert len(health["breakdown"]) == 4
    for item in health["breakdown"]:
        assert "name" in item
        assert "score" in item
        assert "status" in item

    assert isinstance(health["key_strengths"], list)
    assert isinstance(health["urgent_priorities"], list)

    assert "total_insights" in data
    assert "insights" in data
    assert isinstance(data["insights"], list)

    if data["insights"]:
        first_insight = data["insights"][0]
        assert "id" in first_insight
        assert "category" in first_insight
        assert "severity" in first_insight
        assert "title" in first_insight
        assert "recommendation" in first_insight
        assert "estimated_financial_gain" in first_insight
        assert 0.0 <= first_insight["confidence_score"] <= 1.0

