"""
MASDP Backend — User Models.

Pydantic models for user-related data structures.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class UserResponse(BaseModel):
    """Response model for user info from JWT."""
    clerk_user_id: str
    email: Optional[str] = None


class UserInDB(BaseModel):
    """Full user record as stored in Supabase."""
    id: str
    clerk_id: str
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    plan: str = "free"
    created_at: datetime
    updated_at: datetime
