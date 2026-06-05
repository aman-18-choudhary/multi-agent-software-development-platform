"""
MASDP Backend — Agent Service.

Orchestrates the LangGraph pipeline execution and state updates in the database.
"""

import logging
from typing import Optional

from app.db import client as db_client
from app.db import queries
from agents.state import GraphState

logger = logging.getLogger(__name__)


async def save_agent_run(project_id: str, agent_name: str, status: str, output: Optional[dict] = None, duration_ms: Optional[int] = None, llm_model: Optional[str] = None, prompt_tokens: Optional[int] = None, completion_tokens: Optional[int] = None, error: Optional[str] = None) -> None:
    """Updates an agent_run row in the database."""
    # Note: Supabase python client is synchronous. In a true high-throughput
    # production scenario we would use async HTTP calls or a threadpool,
    # but for this MVP the background task blocking briefly is acceptable.
    db = db_client.get_supabase_client()
    queries.update_agent_run(db, project_id, agent_name, status, output, duration_ms, llm_model, prompt_tokens, completion_tokens, error)


async def trigger_pipeline(project_id: str, user_idea: str, project_title: str) -> None:
    """Starts the LangGraph pipeline asynchronously and updates project status."""
    from agents.graph import graph
    
    db = db_client.get_supabase_client()
    
    # 1. Mark project as running
    queries.update_project_status(db, project_id, "running")
    
    # 2. Build initial state
    initial_state = GraphState(
        project_id=project_id,
        user_idea=user_idea,
        project_title=project_title,
        planner_output=None,
        pm_output=None,
        architect_output=None,
        database_output=None,
        documentation_output=None,
        current_agent="planner",
        status="running",
        error=None,
    )
    
    try:
        # 3. Execute LangGraph Pipeline asynchronously
        final_state = await graph.ainvoke(initial_state)
        
        # 4. Success: Mark project as complete
        queries.update_project_status(db, project_id, "complete")
        
    except Exception as e:
        logger.error(f"Pipeline failed for project {project_id}: {e}")
        # Mark project as failed on exception
        queries.update_project_status(db, project_id, "failed")
