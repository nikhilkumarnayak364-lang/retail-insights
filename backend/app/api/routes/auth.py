"""Authentication status and admin verification API endpoints."""

from typing import Optional
from fastapi import APIRouter, Depends, Header, status
from pydantic import BaseModel
from app.core.config import settings
from app.core.security import verify_admin_access

router = APIRouter(prefix="/auth", tags=["Authentication & Access Control"])


class LoginRequest(BaseModel):
    api_key: str


class AuthStatusResponse(BaseModel):
    auth_required: bool
    is_authenticated: bool
    role: str
    message: str


@router.get(
    "/status",
    response_model=AuthStatusResponse,
    status_code=status.HTTP_200_OK,
    summary="Check Authentication Status",
)
async def check_auth_status(
    x_admin_key: Optional[str] = Header(None, alias="X-Admin-Key"),
    authorization: Optional[str] = Header(None, alias="Authorization"),
) -> AuthStatusResponse:
    """Checks whether the client is authenticated as an administrator."""
    if not settings.REQUIRE_AUTH:
        return AuthStatusResponse(
            auth_required=False,
            is_authenticated=True,
            role="admin_open_mode",
            message="Platform is running with unrestricted administrative access.",
        )

    token = x_admin_key
    if not token and authorization:
        parts = authorization.strip().split(" ", 1)
        if len(parts) == 2 and parts[0].lower() == "bearer":
            token = parts[1].strip()

    is_admin = bool(token and token == settings.ADMIN_API_KEY)
    return AuthStatusResponse(
        auth_required=True,
        is_authenticated=is_admin,
        role="admin" if is_admin else "viewer",
        message="Authenticated as administrator." if is_admin else "Authentication required for admin actions.",
    )


@router.post(
    "/verify",
    response_model=AuthStatusResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify Admin Key",
)
async def verify_key(payload: LoginRequest) -> AuthStatusResponse:
    """Verifies an administrator key and returns authentication status."""
    is_admin = payload.api_key.strip() == settings.ADMIN_API_KEY
    return AuthStatusResponse(
        auth_required=settings.REQUIRE_AUTH,
        is_authenticated=is_admin,
        role="admin" if is_admin else "viewer",
        message="Valid administrator key." if is_admin else "Invalid administrator key.",
    )

