"""
MASDP Backend — Retrieval Service.

Handles semantic vector search via Supabase pgvector.
"""

import logging
from typing import Any, Dict, List

from app.db import client as db_client
from app.services.embedding_service import generate_embedding

logger = logging.getLogger(__name__)

def retrieve_relevant_chunks(project_id: str, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Retrieves the most semantically relevant document chunks for a specific project.
    """
    db = db_client.get_supabase_client()
    
    # 1. Generate query embedding
    query_embedding = generate_embedding(query)
    
    # 2. Call the Postgres RPC function
    response = db.rpc("match_document_chunks", {
        "query_embedding": query_embedding,
        "match_count": top_k,
        "filter_project_id": project_id
    }).execute()
    
    return response.data
