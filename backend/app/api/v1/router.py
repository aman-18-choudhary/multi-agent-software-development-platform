"""
MASDP Backend — API v1 Router.

Combines all v1 endpoint routers and defines shared endpoints
like health check. All routes are prefixed with /api/v1.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from app.config import settings
from app.auth.clerk import get_current_user
from app.api.v1.projects import router as projects_router
from app.api.v1.chat import router as chat_router
from app.api.v1.search import router as search_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.share import router as share_router
from app.api.v1.arena import router as arena_router

api_router = APIRouter()

# Register project endpoints
api_router.include_router(projects_router, prefix="/projects", tags=["projects"])
api_router.include_router(chat_router, prefix="/projects", tags=["chat"])
api_router.include_router(search_router, prefix="/search", tags=["search"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["analytics"])
api_router.include_router(share_router, prefix="/share", tags=["share"])
api_router.include_router(arena_router, prefix="/arena", tags=["arena"])



# ── Health Check ─────────────────────────────────────────────
@api_router.get("/health", tags=["system"])
async def health_check():
    """
    Health check endpoint.
    Returns service status, version, and environment info.
    No authentication required.
    """
    return {
        "status": "ok",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ── Authenticated User Info ──────────────────────────────────
@api_router.get("/me", tags=["auth"])
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Return the currently authenticated user's info from their JWT.
    Requires a valid Clerk JWT in the Authorization header.
    """
    return {
        "clerk_user_id": current_user["clerk_user_id"],
        "email": current_user.get("email"),
    }
