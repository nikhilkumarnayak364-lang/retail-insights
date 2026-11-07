"""Tests for API health endpoints and system root."""

import pytest
from starlette.testclient import TestClient


def test_root_endpoint(client: TestClient) -> None:
    """Verify that root endpoint GET / returns application identity and version."""
    response = client.get("/")
    assert response.status_code == 200

    data = response.json()
    assert "application_name" in data
    assert data["application_name"] == "Retail Insights API"
    assert "application_status" in data
    assert data["application_status"] == "online"
    assert "api_version" in data
    assert data["api_version"] == "1.0.0"
    assert "docs_url" in data
    assert data["docs_url"] == "/docs"
    assert "timestamp" in data


def test_health_endpoint(client: TestClient) -> None:
    """Verify that GET /api/health returns operational status and database state."""
    response = client.get("/api/health")
    assert response.status_code == 200

    data = response.json()
    assert data["backend_status"] == "healthy"
    assert data["api_availability"] is True
    assert data["service"] == "Retail Insights API"
    assert data["version"] == "1.0.0"
    assert "environment" in data
    assert "database" in data

    # Verify that Phase 1 database status is truthful and not fabricated
    db_status = data["database"]
    assert "configured" in db_status
    assert "status" in db_status
    assert "database_name" in db_status
    assert db_status["database_name"] == "retail_insights"


def test_frontend_check_endpoint(client: TestClient) -> None:
    """Verify that GET /api/health/frontend-check allows frontend handshake verification."""
    response = client.get("/api/health/frontend-check")
    assert response.status_code == 200

    data = response.json()
    assert data["reachable"] is True
    assert "FastAPI backend is online" in data["message"]
    assert "timestamp" in data
    assert "client_check" in data
    assert data["api_version"] == "1.0.0"


def test_swagger_documentation(client: TestClient) -> None:
    """Verify that OpenAPI schema and Swagger UI documentation endpoints are accessible."""
    openapi_resp = client.get("/openapi.json")
    assert openapi_resp.status_code == 200
    assert openapi_resp.json()["info"]["title"] == "Retail Insights API"

    docs_resp = client.get("/docs")
    assert docs_resp.status_code == 200
    assert "swagger-ui" in docs_resp.text.lower()


def test_cors_headers(client: TestClient) -> None:
    """Verify that CORS middleware responds appropriately to origin requests."""
    headers = {"Origin": "http://localhost:3000"}
    response = client.get("/api/health", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"


def test_custom_404_error_structure(client: TestClient) -> None:
    """Verify that 404 errors adhere to the centralized JSON response format."""
    response = client.get("/api/non-existent-route-999")
    assert response.status_code == 404

    data = response.json()
    assert data["success"] is False
    assert "error" in data
    assert data["error"]["code"] == 404

