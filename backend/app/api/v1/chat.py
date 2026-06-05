"""
MASDP Backend — Chat API Router.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any

from app.auth.clerk import get_current_user
from app.db import client as db_client
from app.db import queries
from app.models.chat import ChatRequest, ChatResponse
from app.services.chat_service import answer_project_question
from app.services.project_service import _ensure_internal_user

router = APIRouter()

@router.post("/{project_id}/chat", response_model=ChatResponse)
async def project_chat(
    project_id: str,
    request: ChatRequest,
    current_user: dict[str, Any] = Depends(get_current_user)
):
    """Answers a question based on the project's embedded context."""
    db = db_client.get_supabase_client()
    internal_user_id = _ensure_internal_user(db, current_user)
    
    project = queries.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        
    if project["user_id"] != internal_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
    try:
        response_data = await answer_project_question(project_id, request.question)
        return ChatResponse(
            answer=response_data["answer"],
            sources=response_data["sources"]
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
