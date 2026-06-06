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
    
    # 2. Call the Postgres RPC function (Semantic Search)
    response = db.rpc("match_document_chunks", {
        "query_embedding": query_embedding,
        "match_count": top_k,
        "filter_project_id": project_id
    }).execute()
    
    semantic_chunks = response.data or []
    
    # 3. Keyword Fallback Search
    stop_words = {"what", "how", "tell", "about", "show", "me", "the", "are", "do", "i", "can", "you"}
    words = [w.lower() for w in query.replace('?', '').replace('.', '').split() if len(w) > 3 and w.lower() not in stop_words]
    
    keyword_chunks = []
    for word in words[:2]:  # Search up to 2 primary keywords
        kw_response = db.table("document_chunks") \
            .select("id, project_id, source_agent, chunk_text, metadata") \
            .eq("project_id", project_id) \
            .ilike("chunk_text", f"%{word}%") \
            .limit(top_k) \
            .execute()
            
        if kw_response.data:
            for c in kw_response.data:
                c["similarity"] = 1.0  # Synthetic high similarity for exact keyword match
                keyword_chunks.append(c)
                
    # 4. Merge and Deduplicate
    seen_ids = set()
    final_chunks = []
    
    # Prioritize keyword matches, then semantic
    for c in keyword_chunks + semantic_chunks:
        c_id = c["id"]
        if c_id not in seen_ids:
            seen_ids.add(c_id)
            final_chunks.append(c)
            
    return final_chunks[:top_k]

def retrieve_global_chunks(query: str, user_id: str, top_k: int = 10) -> List[Dict[str, Any]]:
    """
    Retrieves the most semantically relevant document chunks across ALL projects for a user.
    """
    db = db_client.get_supabase_client()
    
    query_embedding = generate_embedding(query)
    
    # Search globally across all document chunks
    response = db.rpc("match_document_chunks", {
        "query_embedding": query_embedding,
        "match_count": top_k * 2, # Fetch extra to account for cross-user filtering
        "filter_project_id": None
    }).execute()
    
    chunks = response.data
    if not chunks:
        return []
        
    project_ids = list(set([c["project_id"] for c in chunks]))
    
    # Fetch project details to verify ownership and attach titles
    projects_res = db.table("projects").select("id, title, user_id").in_("id", project_ids).execute()
    user_projects = {p["id"]: p["title"] for p in projects_res.data if p["user_id"] == user_id}
    
    filtered_chunks = []
    for c in chunks:
        if c["project_id"] in user_projects:
            c["project_title"] = user_projects[c["project_id"]]
            filtered_chunks.append(c)
            if len(filtered_chunks) == top_k:
                break
                
    return filtered_chunks
