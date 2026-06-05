"""
MASDP Backend — Clerk JWT Authentication.

Verifies Clerk-issued JWTs using the JWKS (JSON Web Key Set) endpoint.
JWKS is cached in memory with a 1-hour TTL to avoid hitting Clerk's
servers on every request.

Uses PyJWT instead of python-jose (deprecated / security concerns).
"""

import logging
from typing import Any

import httpx
import jwt
from cachetools import TTLCache
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import settings

logger = logging.getLogger(__name__)

security = HTTPBearer()

# Cache JWKS for 1 hour (3600 seconds), max 1 entry
_jwks_cache: TTLCache = TTLCache(maxsize=1, ttl=3600)
_JWKS_CACHE_KEY = "clerk_jwks"


async def _fetch_jwks() -> dict[str, Any]:
    """
    Fetch Clerk's JWKS from their well-known endpoint.
    Results are cached in-memory for 1 hour.
    """
    # Return from cache if available
    cached = _jwks_cache.get(_JWKS_CACHE_KEY)
    if cached is not None:
        return cached

    jwks_url = f"https://{settings.CLERK_DOMAIN}/.well-known/jwks.json"
    logger.info(f"Fetching JWKS from {jwks_url}")

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(jwks_url)
            response.raise_for_status()
            jwks_data = response.json()
    except httpx.HTTPError as e:
        logger.error(f"Failed to fetch JWKS: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service unavailable",
        )

    # Cache the result
    _jwks_cache[_JWKS_CACHE_KEY] = jwks_data
    return jwks_data


def _get_signing_key(jwks: dict, token: str) -> jwt.PyJWK:
    """Extract the correct signing key from JWKS based on the token's kid header."""
    try:
        unverified_header = jwt.get_unverified_header(token)
    except jwt.DecodeError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format",
        )

    kid = unverified_header.get("kid")
    if not kid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing key ID (kid)",
        )

    # Find matching key in JWKS
    for key_data in jwks.get("keys", []):
        if key_data.get("kid") == kid:
            return jwt.PyJWK(key_data)

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unable to find matching signing key",
    )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict[str, Any]:
    """
    FastAPI dependency that verifies a Clerk JWT and returns user info.

    Usage:
        @router.get("/protected")
        async def protected_route(user = Depends(get_current_user)):
            return {"user_id": user["clerk_user_id"]}
    """
    token = credentials.credentials

    # Fetch (or retrieve cached) JWKS
    jwks = await _fetch_jwks()

    # Get the correct signing key
    signing_key = _get_signing_key(jwks, token)

    # Decode and verify the token
    try:
        issuer = f"https://{settings.CLERK_DOMAIN}"
        decode_options = {
            "verify_aud": bool(settings.CLERK_AUDIENCE),
            "verify_iss": True,
        }

        payload = jwt.decode(
            token,
            signing_key,
            algorithms=["RS256"],
            audience=settings.CLERK_AUDIENCE if settings.CLERK_AUDIENCE else None,
            issuer=issuer,
            options=decode_options,
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    # Extract user identity
    clerk_user_id = payload.get("sub")
    if not clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject (sub) claim",
        )

    return {
        "clerk_user_id": clerk_user_id,
        "email": payload.get("email", ""),
        "session_id": payload.get("sid", ""),
    }
