"""
MASDP Backend — Global Search Service.

Handles cross-project RAG and global architecture knowledge querying.
"""

import logging
import asyncio
from typing import Dict, Any

from groq import AsyncGroq

from app.config import settings
from app.services.retrieval_service import retrieve_global_chunks

logger = logging.getLogger(__name__)

async def answer_global_question(user_id: str, question: str) -> Dict[str, Any]:
    """Retrieves context across ALL projects and answers a global architecture question."""
    
    # 1. Retrieve relevant chunks globally
    chunks = await asyncio.to_thread(retrieve_global_chunks, question, user_id, 15)
    
    # 2. Build context
    unique_projects = set()
    context_lines = []
    
    # Group by project for cleaner context
    project_chunks = {}
    for chunk in chunks:
        title = chunk.get("project_title", "Unknown Project")
        unique_projects.add(title)
        if title not in project_chunks:
            project_chunks[title] = []
        project_chunks[title].append(f"Agent: {chunk.get('source_agent', 'unknown')}\n{chunk.get('chunk_text', '')}")
        
    for title, texts in project_chunks.items():
        context_lines.append(f"### Project: {title}")
        context_lines.append("\n---\n".join(texts))
        context_lines.append("")
        
    context_text = "\n".join(context_lines)
    
    # 3. Generate answer using Groq
    if not settings.GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not configured")
        
    client = AsyncGroq(api_key=settings.GROQ_API_KEY)
    
    prompt = f"""You are an AI Software Architecture Analyst.

Use ONLY the supplied project contexts.

When comparing projects:
* highlight similarities
* highlight differences

If the information does not exist:
respond exactly:
"I could not find that information."

Return citations to project titles.

PROJECT CONTEXTS:
{context_text}

QUESTION:
{question}
"""
    
    response = await client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.1-8b-instant",
        temperature=0.1,
        max_tokens=2048,
    )
    
    generated_answer = response.choices[0].message.content.strip()
    
    if "I could not find that information" in generated_answer:
        unique_projects.clear()
        
    # 4. Return
    return {
        "answer": generated_answer,
        "projects": list(unique_projects)
    }
