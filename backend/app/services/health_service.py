"""Health check business logic service layer."""

from datetime import datetime, timezone
from app.core.config import settings
from app.database.connection import db_manager
from app.schemas.health import RootResponse, HealthResponse, FrontendCheckResponse


class HealthService:
    """Encapsulates system status and health verification logic."""

    @staticmethod
    def get_root_info() -> RootResponse:
        """Constructs information payload for the root endpoint."""
        return RootResponse(
            application_name=settings.PROJECT_NAME,
            application_status="online",
            api_version=settings.VERSION,
            docs_url="/docs",
            timestamp=datetime.now(timezone.utc).isoformat(),
        )

    @staticmethod
    def get_health_status() -> HealthResponse:
        """Inspects subsystem health including database and environment."""
        db_status = db_manager.get_status()
        return HealthResponse(
            backend_status="healthy",
            api_availability=True,
            service=settings.PROJECT_NAME,
            version=settings.VERSION,
            environment=settings.ENVIRONMENT,
            timestamp=datetime.now(timezone.utc).isoformat(),
            database=db_status,
        )

    @staticmethod
    def get_frontend_check(client_hint: str = "Next.js Frontend") -> FrontendCheckResponse:
        """Returns verification payload specifically designed for frontend handshake."""
        return FrontendCheckResponse(
            reachable=True,
            message="FastAPI backend is online, healthy, and communicating with the frontend.",
            timestamp=datetime.now(timezone.utc).isoformat(),
            client_check=f"Verified connection from {client_hint}",
            api_version=settings.VERSION,
        )

