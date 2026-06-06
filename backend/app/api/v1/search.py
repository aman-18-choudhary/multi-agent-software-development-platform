"""
MASDP Backend — Global Search API Router.
"""

import json
import time
import asyncio
import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from groq import AsyncGroq
from app.config import settings
from app.auth.clerk import get_current_user
from app.db import client as db_client
from app.models.global_chat import GlobalChatRequest, GlobalChatResponse
from app.services.retrieval_service import retrieve_global_chunks
from app.services.project_service import _ensure_internal_user
from app.services.chat_history_service import save_message, get_chat_history, clear_chat_history
from app.services.rag_metrics_service import log_rag_query

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/chat")
async def get_global_chat(current_user: dict[str, Any] = Depends(get_current_user)):
    db = db_client.get_supabase_client()
    internal_user_id = _ensure_internal_user(db, current_user)
    return get_chat_history(db, internal_user_id, None, "global")

@router.delete("/chat")
async def delete_global_chat(current_user: dict[str, Any] = Depends(get_current_user)):
    db = db_client.get_supabase_client()
    internal_user_id = _ensure_internal_user(db, current_user)
    clear_chat_history(db, internal_user_id, None, "global")
    return {"status": "cleared"}

@router.post("/chat/stream")
async def global_chat_stream(
    request: GlobalChatRequest,
    current_user: dict[str, Any] = Depends(get_current_user)
):
    """Answers a question across all projects for the user with streaming."""
    db = db_client.get_supabase_client()
    internal_user_id = _ensure_internal_user(db, current_user)
    
    # Save user message
    save_message(db, internal_user_id, None, 'global', 'user', request.question)

    start_time = time.time()
    chunks = await asyncio.to_thread(retrieve_global_chunks, request.question, internal_user_id, 15)
    
    unique_projects = set()
    context_lines = []
    sources = []
    
    project_chunks = {}
    for c in chunks:
        title = c.get("project_title", "Unknown Project")
        unique_projects.add(title)
        
        agent = c.get("source_agent", "unknown")
        sources.append({
            "source_agent": agent,
            "similarity": c.get("similarity"),
            "chunk_id": c.get("id"),
            "project_id": c.get("project_id"),
            "project_title": title,
            "chunk_text": c.get("chunk_text")
        })
        
        if title not in project_chunks:
            project_chunks[title] = []
        project_chunks[title].append(f"Agent: {agent}\n{c.get('chunk_text', '')}")
        
    for title, texts in project_chunks.items():
        context_lines.append(f"### Project: {title}")
        context_lines.append("\n---\n".join(texts))
        context_lines.append("")
        
    context_text = "\n".join(context_lines)

    async def generate():
        client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        prompt = f"""You are an AI Software Architecture Analyst.
Use ONLY the supplied project contexts.
When comparing projects:
* highlight similarities
* highlight differences
If the information does not exist, respond exactly:
"I could not find that information."
Return citations to project titles.

PROJECT CONTEXTS:
{context_text}

QUESTION:
{request.question}"""
        
        try:
            stream = await client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.1-8b-instant",
                temperature=0.1,
                max_tokens=2048,
                stream=True
            )
            
            full_response = ""
            async for chunk in stream:
                content = chunk.choices[0].delta.content
                if content:
                    full_response += content
                    yield f"data: {json.dumps({'text': content})}\n\n"
            
            valid_sources = []
            if "I could not find that information" not in full_response:
                # Deduplicate sources based on project and agent
                seen_pairs = set()
                for s in sources:
                    pair = (s["project_title"], s["source_agent"])
                    if pair not in seen_pairs:
                        seen_pairs.add(pair)
                        valid_sources.append(s)

            save_message(db, internal_user_id, None, 'global', 'assistant', full_response, {"sources": valid_sources})
            
            avg_sim = sum(s["similarity"] for s in chunks) / len(chunks) if chunks else 0.0
            duration_ms = int((time.time() - start_time) * 1000)
            log_rag_query(db, internal_user_id, None, request.question, len(chunks), avg_sim, duration_ms, source_agents = [str(s.get("source_agent", "unknown")) for s in valid_sources])
            
            yield f"data: {json.dumps({'done': True, 'sources': valid_sources})}\n\n"
            
        except Exception as e:
            logger.error(f"Streaming error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            
    return StreamingResponse(generate(), media_type="text/event-stream")

@router.get("")
async def search_projects(
    query: str,
    current_user: dict[str, Any] = Depends(get_current_user)
):
    """Returns top raw chunks globally matching the query."""
    db = db_client.get_supabase_client()
    internal_user_id = _ensure_internal_user(db, current_user)
    
    try:
        chunks = await asyncio.to_thread(retrieve_global_chunks, query, internal_user_id, 10)
        return chunks
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
