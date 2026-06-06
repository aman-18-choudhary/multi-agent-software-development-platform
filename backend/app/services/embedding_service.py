"""
MASDP Backend — Embedding Service.

Handles text embedding generation using sentence-transformers and storage in Supabase pgvector.
"""

import logging
from typing import Dict, Optional

from sentence_transformers import SentenceTransformer

from app.db import client as db_client
from app.utils.text_chunker import chunk_text

logger = logging.getLogger(__name__)

# Lazy initialization of the model
_model = None

def get_model():
    global _model
    if _model is None:
        logger.info("Initializing SentenceTransformer model 'all-MiniLM-L6-v2'")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model

def generate_embedding(text: str) -> list[float]:
    """Generates an embedding vector for the given text."""
    model = get_model()
    return model.encode(text).tolist()

def store_chunk(db, project_id: str, source_agent: str, chunk_text: str, embedding: list[float], metadata: Optional[Dict] = None):
    """Inserts a single chunk into the document_chunks table."""
    db.table("document_chunks").insert({
        "project_id": project_id,
        "source_agent": source_agent,
        "chunk_text": chunk_text,
        "embedding": embedding,
        "metadata": metadata or {}
    }).execute()

def embed_project_outputs(project_id: str,
                          planner_output: Optional[Dict],
                          pm_output: Optional[Dict],
                          architect_output: Optional[Dict],
                          database_output: Optional[Dict],
                          documentation_output: Optional[Dict],
                          critic_output: Optional[Dict] = None,
                          improver_output: Optional[Dict] = None):
    """Processes all agent outputs, chunks them, generates embeddings, and stores them."""
    logger.info("embedding_started")
    db = db_client.get_supabase_client()
    
    agent_outputs = {
        "planner": planner_output,
        "pm": pm_output,
        "architect": architect_output,
        "database": database_output,
        "documentation": documentation_output,
        "critic": critic_output,
        "improver": improver_output
    }
    
    agent_chunks_map = {}
    for agent_name, output_dict in agent_outputs.items():
        if not output_dict:
            continue
            
        text_lines = []
        for key, value in output_dict.items():
            if isinstance(value, list):
                val_str = "\n".join([f"- {str(v)}" for v in value])
            else:
                val_str = str(value)
            text_lines.append(f"## {key.replace('_', ' ').title()}\n{val_str}")
            
        full_text = "\n\n".join(text_lines)
        chunks = chunk_text(full_text)
        agent_chunks_map[agent_name] = chunks
        
    logger.info("chunks_created")
    
    for agent_name, chunks in agent_chunks_map.items():
        for i, chunk in enumerate(chunks):
            embedding = generate_embedding(chunk)
            store_chunk(db, project_id, agent_name, chunk, embedding, {"chunk_index": i})
            
    logger.info("embeddings_generated")
    logger.info("embedding_complete")
