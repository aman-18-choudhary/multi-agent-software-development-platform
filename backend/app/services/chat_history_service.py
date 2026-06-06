"""
MASDP Backend — Chat History Service.

Handles persistent chat messages and context caching in Supabase.
"""

import logging
from typing import Optional, List, Dict, Any

from app.db import client as db_client

logger = logging.getLogger(__name__)

def save_message(db, user_id: str, project_id: Optional[str], chat_type: str, role: str, message: str, metadata: Optional[Dict] = None):
    """Saves a chat message."""
    try:
        db.table("project_chats").insert({
            "user_id": user_id,
            "project_id": project_id,
            "chat_type": chat_type,
            "role": role,
            "message": message,
            "metadata": metadata or {}
        }).execute()
    except Exception as e:
        logger.error(f"Failed to save message: {e}")

def get_chat_history(db, user_id: str, project_id: Optional[str], chat_type: str) -> List[Dict[str, Any]]:
    """Retrieves chat history ordered by creation time."""
    try:
        query = db.table("project_chats").select("*").eq("user_id", user_id).eq("chat_type", chat_type)
        if project_id:
            query = query.eq("project_id", project_id)
        else:
            query = query.is_("project_id", "null")
            
        res = query.order("created_at").execute()
        return res.data
    except Exception as e:
        logger.error(f"Failed to get chat history: {e}")
        return []

def clear_chat_history(db, user_id: str, project_id: Optional[str], chat_type: str):
    """Deletes chat history."""
    try:
        query = db.table("project_chats").delete().eq("user_id", user_id).eq("chat_type", chat_type)
        if project_id:
            query = query.eq("project_id", project_id)
        else:
            query = query.is_("project_id", "null")
            
        query.execute()
    except Exception as e:
        logger.error(f"Failed to clear chat history: {e}")
