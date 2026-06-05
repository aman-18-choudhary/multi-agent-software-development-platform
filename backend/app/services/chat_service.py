"""
MASDP Backend — Chat Service.

Provides RAG chat capabilities over a project's embedded chunks.
"""

import logging
import asyncio
from typing import Dict, Any

from groq import AsyncGroq

from app.config import settings
from app.services.retrieval_service import retrieve_relevant_chunks

logger = logging.getLogger(__name__)

async def answer_project_question(project_id: str, question: str) -> Dict[str, Any]:
    """Retrieves context and answers a user question using Groq."""
    
    # STEP 1: Retrieve relevant chunks
    chunks = await asyncio.to_thread(retrieve_relevant_chunks, project_id, question, 5)
    
    # STEP 2: Build context
    context_lines = []
    unique_sources = set()
    for chunk in chunks:
        agent = chunk.get("source_agent", "unknown")
        unique_sources.add(agent)
        context_lines.append(f"Source: {agent}\n{chunk.get('chunk_text', '')}\n")
        
    context_text = "\n".join(context_lines)
    
    # STEP 3: Generate answer using Groq
    if not settings.GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not configured")
        
    client = AsyncGroq(api_key=settings.GROQ_API_KEY)
    
    prompt = f"""You are an expert software architect.

Answer ONLY using the supplied project context.

Do NOT invent information.

If the answer is not present in the context,
respond exactly:

"I could not find that information in the project."

PROJECT CONTEXT:

{context_text}

QUESTION:

{question}
"""
    
    response = await client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.1-8b-instant",
        temperature=0.0,
        max_tokens=2048,
    )
    
    generated_answer = response.choices[0].message.content.strip()
    
    if "I could not find that information in the project." in generated_answer:
        unique_sources.clear()
        
    # STEP 4: Return
    return {
        "answer": generated_answer,
        "sources": list(unique_sources)
    }
