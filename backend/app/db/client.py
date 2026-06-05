"""
MASDP Backend — Supabase Client.

Provides a singleton Supabase client using the service role key
(which bypasses RLS). Used by backend services for all DB operations.
"""

import logging

from supabase import create_client, Client

from app.config import settings

logger = logging.getLogger(__name__)

# Singleton client instance
_supabase_client: Client | None = None


def get_supabase_client() -> Client:
    """
    Get or create the Supabase client singleton.
    Uses the service role key for full DB access (bypasses RLS).
    """
    global _supabase_client

    if _supabase_client is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            logger.warning("Supabase credentials not configured — DB operations will fail")
            raise RuntimeError("Supabase URL and service role key must be configured")

        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )
        logger.info("Supabase client initialized successfully")

    return _supabase_client


async def test_supabase_connection() -> bool:
    """
    Test the Supabase connection by querying the users table.
    Returns True if connection succeeds, False otherwise.
    Called during FastAPI startup lifespan.
    """
    try:
        client = get_supabase_client()
        # Simple query to test connectivity
        client.table("users").select("id").limit(1).execute()
        logger.info("✅ Supabase connection verified")
        return True
    except Exception as e:
        logger.warning(f"⚠️ Supabase connection test failed: {e}")
        logger.warning("The app will start but DB operations may fail.")
        return False
