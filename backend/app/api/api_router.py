"""Main API router combining all domain-specific routers."""

from fastapi import APIRouter
from app.api.routes import health, datasets, analytics, currency, auth

api_router = APIRouter()

# Include health routes (/api/health, /api/health/frontend-check)
api_router.include_router(health.router)

# Include dataset management routes (/api/datasets)
api_router.include_router(datasets.router)

# Include analytics routes (/api/analytics)
api_router.include_router(analytics.router)

# Include currency routes (/api/currency)
api_router.include_router(currency.router)

# Include auth routes (/api/auth)
api_router.include_router(auth.router)
