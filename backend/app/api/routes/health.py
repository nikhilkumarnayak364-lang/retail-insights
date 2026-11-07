"""Health and diagnostic API endpoints."""

from fastapi import APIRouter, status
from app.schemas.health import HealthResponse, FrontendCheckResponse
from app.services.health_service import HealthService

router = APIRouter(prefix="/health", tags=["Health & Diagnostics"])


@router.get(
    "",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="System Health Check",
    description="Returns backend health, API availability, runtime environment, and database status.",
)
async def get_health() -> HealthResponse:
    """Check backend operational health and subsystem availability."""
    return HealthService.get_health_status()


@router.get(
    "/frontend-check",
    response_model=FrontendCheckResponse,
    status_code=status.HTTP_200_OK,
    summary="Frontend Handshake Verification",
    description="Enables the Next.js frontend to verify direct connectivity to the FastAPI backend.",
)
async def frontend_check() -> FrontendCheckResponse:
    """Handshake endpoint for frontend connectivity verification."""
    return HealthService.get_frontend_check(client_hint="Next.js Client")

