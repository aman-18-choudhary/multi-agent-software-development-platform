"""
MASDP Backend — RAG Metrics Service.

Handles telemetry and analytics tracking for RAG interactions.
"""

import logging
from typing import Optional, List, Dict, Any

from app.db import client as db_client

logger = logging.getLogger(__name__)

def log_rag_query(db, user_id: str, project_id: Optional[str], query: str, chunks_retrieved: int, avg_similarity: float, response_time_ms: int, source_agents: List[str]):
    """Logs a single RAG interaction."""
    try:
        db.table("rag_metrics").insert({
            "user_id": user_id,
            "project_id": project_id,
            "query": query,
            "chunks_retrieved": chunks_retrieved,
            "avg_similarity": avg_similarity,
            "response_time_ms": response_time_ms,
            "source_agents": source_agents
        }).execute()
    except Exception as e:
        logger.error(f"Failed to log RAG query metrics: {e}")

def get_rag_analytics(db, user_id: str) -> Dict[str, Any]:
    """Retrieves aggregated RAG analytics for the user dashboard."""
    try:
        res = db.table("rag_metrics").select("*").eq("user_id", user_id).execute()
        metrics = res.data
        
        if not metrics:
            return {}
            
        total_queries = len(metrics)
        avg_chunks = sum(m.get("chunks_retrieved", 0) for m in metrics) / total_queries
        avg_sim = sum(m.get("avg_similarity", 0) for m in metrics) / total_queries
        avg_resp = sum(m.get("response_time_ms", 0) for m in metrics) / total_queries
        fastest = min(m.get("response_time_ms", 0) for m in metrics)
        slowest = max(m.get("response_time_ms", 0) for m in metrics)
        
        projects_queried = len(set(m.get("project_id") for m in metrics if m.get("project_id")))
        
        agent_counts = {}
        for m in metrics:
            agents = m.get("source_agents", [])
            for a in agents:
                agent_counts[a] = agent_counts.get(a, 0) + 1
                
        total_agents = sum(agent_counts.values())
        agent_percentages = {a: (count / total_agents * 100) for a, count in agent_counts.items()} if total_agents > 0 else {}
        
        return {
            "total_questions": total_queries,
            "projects_queried": projects_queried,
            "avg_chunks_retrieved": avg_chunks,
            "avg_similarity": avg_sim,
            "avg_response_time_ms": avg_resp,
            "fastest_query_ms": fastest,
            "slowest_query_ms": slowest,
            "sources": agent_percentages
        }
    except Exception as e:
        logger.error(f"Failed to get RAG analytics: {e}")
        return {}
