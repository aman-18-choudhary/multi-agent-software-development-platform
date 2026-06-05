"""
MASDP Backend — Application Configuration.

Reads environment variables from .env file using Pydantic Settings.
All secrets and config values are centralized here.
"""

from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── App ──────────────────────────────────────────────
    ENVIRONMENT: str = "development"
    APP_VERSION: str = "1.0.0"
    APP_TITLE: str = "MASDP API"

    # ── Clerk Authentication ─────────────────────────────
    CLERK_SECRET_KEY: str = ""
    CLERK_DOMAIN: str = ""
    CLERK_AUDIENCE: str = ""

    # ── Supabase ─────────────────────────────────────────
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # ── Observability ────────────────────────────────────
    SENTRY_DSN: Optional[str] = None
    
    # LLM Settings
    GROQ_API_KEY: Optional[str] = None

    # ── CORS ─────────────────────────────────────────────
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    @property
    def cors_origins(self) -> list[str]:
        """Parse comma-separated CORS origins into a list."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"


settings = Settings()
