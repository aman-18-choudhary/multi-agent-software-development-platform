"""
MASDP Backend — Project Chat Router.
"""

import json
import time
import asyncio
import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from groq import AsyncGroq

from app.config import settings
from app.auth.clerk import get_current_user
from app.db import client as db_client
from app.db import queries
from app.services.project_service import _ensure_internal_user
from app.services.retrieval_service import retrieve_relevant_chunks
from app.services.chat_history_service import save_message, get_chat_history, clear_chat_history
from app.services.rag_metrics_service import log_rag_query

logger = logging.getLogger(__name__)
router = APIRouter()

class ChatRequest(BaseModel):
    question: str

@router.get("/{project_id}/chat")
async def get_project_chat(
    project_id: str,
    current_user: dict[str, Any] = Depends(get_current_user)
):
    db = db_client.get_supabase_client()
    internal_user_id = _ensure_internal_user(db, current_user)
    
    project = queries.get_project_by_id(db, project_id)
    if not project or project["user_id"] != internal_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
    return get_chat_history(db, internal_user_id, project_id, "project")

@router.delete("/{project_id}/chat")
async def delete_project_chat(
    project_id: str,
    current_user: dict[str, Any] = Depends(get_current_user)
):
    db = db_client.get_supabase_client()
    internal_user_id = _ensure_internal_user(db, current_user)
    
    project = queries.get_project_by_id(db, project_id)
    if not project or project["user_id"] != internal_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
    clear_chat_history(db, internal_user_id, project_id, "project")
    return {"status": "cleared"}

@router.post("/{project_id}/chat/stream")
async def project_chat_stream(
    project_id: str,
    request: ChatRequest,
    current_user: dict[str, Any] = Depends(get_current_user)
):
    db = db_client.get_supabase_client()
    internal_user_id = _ensure_internal_user(db, current_user)
    
    project = queries.get_project_by_id(db, project_id)
    if not project or project["user_id"] != internal_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # 1. Save user message to history
    save_message(db, internal_user_id, project_id, 'project', 'user', request.question)

    # 2. Retrieve chunks
    start_time = time.time()
    chunks = await asyncio.to_thread(retrieve_relevant_chunks, project_id, request.question, 15)
    
    context_lines = []
    sources = []
    avg_sim = 0.0
    if chunks:
        avg_sim = sum(c.get("similarity", 0) for c in chunks) / len(chunks)
        for c in chunks:
            agent = c.get("source_agent", "unknown")
            sources.append({
                "source_agent": agent,
                "similarity": c.get("similarity"),
                "chunk_id": c.get("id"),
                "project_id": c.get("project_id"),
                "chunk_text": c.get("chunk_text") # Return text for inspector modal!
            })
            context_lines.append(f"Source: {agent}\n{c.get('chunk_text', '')}\n")
            
    context_text = "\n".join(context_lines)

    async def generate():
        client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        prompt = f"""You are an expert software architect and assistant for MASDP.
Answer ONLY using the supplied project context.
Do NOT invent information.
CRITICAL INSTRUCTIONS FOR PARTIAL MATCHES:
If the retrieved context contains ANY mention of the entities or keywords in the user's question, you MUST answer using that information, even if it is just a brief mention or a partial match.
For example, if the user asks about a technology and it is only listed as a prerequisite, you must state that it is a prerequisite.
Do not require an exact section title match. Extract and summarize whatever fragment is available.

Only return "I could not find that information in the project." if the context is completely empty or completely unrelated.

If the user asks to export the project (PDF, Markdown, JSON, PPTX), instruct them to click the "Export" dropdown button at the top of the project detail page.
If the user asks to share the project, instruct them to click the "Share" button at the top of the project detail page to generate a public link.

PROJECT CONTEXT:
{context_text}

QUESTION:
{request.question}"""
        
        try:
            stream = await client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.1-8b-instant",
                temperature=0.0,
                max_tokens=2048,
                stream=True
            )
            
            full_response = ""
            async for chunk in stream:
                content = chunk.choices[0].delta.content
                if content:
                    full_response += content
                    yield f"data: {json.dumps({'text': content})}\n\n"
            
            # Post-processing
            valid_sources = []
            if "I could not find that information" not in full_response:
                # Deduplicate sources based on agent
                seen_agents = set()
                for s in sources:
                    if s["source_agent"] not in seen_agents:
                        seen_agents.add(s["source_agent"])
                        valid_sources.append(s)
            
            # Save assistant message
            save_message(db, internal_user_id, project_id, 'project', 'assistant', full_response, {"sources": valid_sources})
            
            # Log metrics
            duration_ms = int((time.time() - start_time) * 1000)
            source_agents = [str(s.get("source_agent", "unknown")) for s in valid_sources]
            log_rag_query(db, internal_user_id, project_id, request.question, len(chunks), avg_sim, duration_ms, source_agents)
            
            yield f"data: {json.dumps({'done': True, 'sources': valid_sources})}\n\n"
            
        except Exception as e:
            logger.error(f"Streaming error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            
    return StreamingResponse(generate(), media_type="text/event-stream")
