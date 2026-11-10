"""Security, authentication, and authorization helpers for Retail Insights.

Provides single-admin access validation for mutating endpoints while keeping
read-only analytical operations frictionless and reliable.
"""

from typing import Optional
from fastapi import Header, HTTPException, status
from app.core.config import settings
from app.core.logging import logger


def verify_admin_access(
    x_admin_key: Optional[str] = Header(None, alias="X-Admin-Key"),
    authorization: Optional[str] = Header(None, alias="Authorization"),
) -> bool:
    """Verifies administrator credentials.
    
    If REQUIRE_AUTH is enabled in settings, callers must supply either:
      - Header `X-Admin-Key: <ADMIN_API_KEY>`
      - Header `Authorization: Bearer <ADMIN_API_KEY>`
    
    If REQUIRE_AUTH is False (default in development), open access is preserved.
    """
    if not settings.REQUIRE_AUTH:
        return True

    token = x_admin_key
    if not token and authorization:
        parts = authorization.strip().split(" ", 1)
        if len(parts) == 2 and parts[0].lower() == "bearer":
            token = parts[1].strip()

    if token and token == settings.ADMIN_API_KEY:
        return True

    logger.warning("Unauthorized access attempt to administrative endpoint.")
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unauthorized. A valid administrator key is required to perform this action.",
        headers={"WWW-Authenticate": "Bearer"},
    )

