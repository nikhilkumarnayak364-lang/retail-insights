"""Retail Insights - FastAPI Main Application Entrypoint."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.logging import logger
from app.database.connection import db_manager
from app.schemas.health import RootResponse
from app.services.health_service import HealthService
from app.api.api_router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan context manager for application startup and shutdown events."""
    logger.info("Initializing %s v%s...", settings.PROJECT_NAME, settings.VERSION)
    logger.info("Running in environment: %s", settings.ENVIRONMENT)

    # Initialize database connection (deferred if URI is empty in Phase 1)
    db_manager.connect()

    logger.info("Application startup complete. API docs ready at /docs")
    yield

    logger.info("Shutting down application...")
    db_manager.disconnect()
    logger.info("Application shutdown complete.")


# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Centralized Exception Handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Centralized handler for HTTP exceptions."""
    logger.warning("HTTP error occurred: %d - %s at path %s", exc.status_code, exc.detail, request.url.path)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.status_code,
                "message": exc.detail,
                "path": request.url.path,
            },
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Centralized handler for request validation errors."""
    logger.warning("Request validation failed at %s: %s", request.url.path, exc.errors())
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": {
                "code": 422,
                "message": "Request payload validation error",
                "details": exc.errors(),
                "path": request.url.path,
            },
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Centralized handler for unhandled internal exceptions."""
    logger.error("Unhandled server exception at %s: %s", request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": 500,
                "message": "Internal server error occurred",
                "path": request.url.path,
            },
        },
    )


# Root Endpoint (GET /)
@app.get(
    "/",
    response_model=RootResponse,
    status_code=status.HTTP_200_OK,
    tags=["Root"],
    summary="Application Root",
    description="Returns application identity, operational status, version, and documentation link.",
)
async def get_root() -> RootResponse:
    """Returns application name, status, and API version."""
    return HealthService.get_root_info()


# Mount modular API router under /api
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

