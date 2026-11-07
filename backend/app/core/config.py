"""Application configuration settings using Pydantic Settings."""

import os
from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Core application settings loaded from environment variables."""

    # Project Information
    PROJECT_NAME: str = "Retail Insights API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = (
        "Enterprise-grade Retail Analytics & Business Intelligence Backend API"
    )
    API_V1_PREFIX: str = "/api"
    ENVIRONMENT: str = "development"

    # CORS Configuration
    FRONTEND_ORIGIN: str = "http://localhost:3000"
    ADDITIONAL_ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    # Database Configuration (Prepared for Phase 2 - MongoDB Atlas)
    MONGODB_URI: str = Field(default="", description="MongoDB Atlas Connection URI")
    MONGODB_DATABASE: str = Field(default="retail_insights", description="Database name")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def cors_origins(self) -> List[str]:
        """Aggregate all allowed CORS origins dynamically."""
        if self.FRONTEND_ORIGIN and self.FRONTEND_ORIGIN.strip() == "*":
            return ["*"]
        origins = set(self.ADDITIONAL_ALLOWED_ORIGINS)
        if self.FRONTEND_ORIGIN:
            # Handle comma-separated list of origins or single origin
            for org in self.FRONTEND_ORIGIN.split(","):
                org_clean = org.strip().rstrip("/")
                if org_clean:
                    origins.add(org_clean)
        return list(origins)


# Singleton instance
settings = Settings()

