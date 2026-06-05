"""
MASDP Backend — Shared FastAPI Dependencies.

Centralized dependency injection for auth, database, and other
shared services used across all API endpoints.
"""

from typing import Any

from fastapi import Depends
from supabase import Client

from app.auth.clerk import get_current_user
from app.db.client import get_supabase_client


async def get_authenticated_user(
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    """
    Get the currently authenticated user from the Clerk JWT.
    This is the standard dependency for all protected endpoints.
    """
    return current_user


def get_db() -> Client:
    """
    Get the Supabase client instance.
    Use this dependency to access the database in route handlers.
    """
    return get_supabase_client()
