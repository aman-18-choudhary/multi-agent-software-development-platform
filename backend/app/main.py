"""
MASDP Backend — Main FastAPI Application.

Entry point for the backend server. Configures middleware,
error handling (Sentry), lifespan events, and routers.
"""

import logging
from contextlib import asynccontextmanager

import sentry_sdk
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.config import settings
from app.db.client import test_supabase_connection

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Initialize Sentry if DSN is configured
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.ENVIRONMENT,
        traces_sample_rate=1.0 if not settings.is_production else 0.1,
    )
    logger.info("Sentry initialized")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan manager.
    Runs on startup and shutdown.
    """
    # Startup: Test database connection
    logger.info("Starting up MASDP Backend...")
    await test_supabase_connection()

    yield

    # Shutdown: Clean up resources
    logger.info("Shutting down MASDP Backend...")


# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_TITLE,
    version=settings.APP_VERSION,
    description="Multi-Agent Autonomous Software Development Platform API",
    lifespan=lifespan,
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(api_router, prefix="/api/v1")


@app.get("/", include_in_schema=False)
async def root():
    """Redirect root to health check."""
    return {"message": "MASDP API is running. Check /api/v1/health for status."}
