"""Pydantic schemas for root and health check endpoints."""

from typing import Dict, Any, Optional
from pydantic import BaseModel, Field


class RootResponse(BaseModel):
    """Response payload for the root endpoint (GET /)."""

    application_name: str = Field(..., description="Application name")
    application_status: str = Field(..., description="Overall application status")
    api_version: str = Field(..., description="Semantic API version")
    docs_url: str = Field(..., description="Interactive Swagger API documentation URL")
    timestamp: str = Field(..., description="Server timestamp (ISO format)")


class HealthResponse(BaseModel):
    """Response payload for system health check (GET /api/health)."""

    backend_status: str = Field(..., description="Backend service health status")
    api_availability: bool = Field(..., description="Flag indicating if API endpoints are available")
    service: str = Field(..., description="Name of the running service")
    version: str = Field(..., description="Service version")
    environment: str = Field(..., description="Runtime environment")
    timestamp: str = Field(..., description="Server timestamp (ISO format)")
    database: Dict[str, Any] = Field(..., description="True database connectivity status")


class FrontendCheckResponse(BaseModel):
    """Response payload for frontend-backend handshake (GET /api/health/frontend-check)."""

    reachable: bool = Field(..., description="True if backend is reachable by frontend")
    message: str = Field(..., description="Handshake confirmation message")
    timestamp: str = Field(..., description="Server timestamp (ISO format)")
    client_check: str = Field(..., description="Echo of frontend verification status")
    api_version: str = Field(..., description="API version serving the request")

