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
        logger.info("STEP A: graph complete")
        
        # 4. Generate embeddings for the outputs
        import asyncio
        from app.services.embedding_service import embed_project_outputs
        
        def _dump(output):
            if not output: return None
            return output.model_dump() if hasattr(output, "model_dump") else output
            
        logger.info("STEP B: embeddings starting")
        await asyncio.to_thread(
            embed_project_outputs,
            project_id,
            _dump(final_state.get("planner_output")),
            _dump(final_state.get("pm_output")),
            _dump(final_state.get("architect_output")),
            _dump(final_state.get("database_output")),
            _dump(final_state.get("documentation_output")),
            _dump(final_state.get("critic_output")),
            _dump(final_state.get("improver_output"))
        )
        logger.info("STEP B DONE: embeddings complete")
        
        from app.services.version_service import snapshot_project_version
        critic_out = final_state.get("critic_output", {})
        score = critic_out.get("overall_score", 0) if critic_out else 0
        
        logger.info("STEP C: snapshot starting")
        await asyncio.to_thread(snapshot_project_version, db, project_id, score)
        logger.info("STEP C DONE: snapshot complete")
        
        # 5. Success: Mark project as complete
        logger.info("STEP D: updating project status")
        queries.update_project_status(db, project_id, "complete")
        logger.info("STEP D DONE: project marked complete")
        
    except asyncio.CancelledError:
        logger.exception("Pipeline cancelled")
        queries.update_project_status(db, project_id, "failed")
        raise
    except Exception:
        logger.exception("Pipeline failed")
        queries.update_project_status(db, project_id, "failed")

async def trigger_iteration_pipeline(project_id: str, improvement_goal: str) -> None:
    from agents.graph import graph
    from app.services.version_service import snapshot_project_version
    import asyncio
    
    db = db_client.get_supabase_client()
    queries.update_project_status(db, project_id, "running")
    
    project = queries.get_project_by_id(db, project_id)
    runs = queries.get_agent_runs_for_project(db, project_id)
    outputs = {r["agent_name"]: r.get("output") for r in runs}
    
    from agents.state import PlannerOutput, PMOutput, ArchitectOutput, DatabaseOutput, DocumentationOutput
    initial_state = GraphState(
        project_id=project_id,
        user_idea=project["description"],
        project_title=project["title"],
        improvement_goal=improvement_goal,
        planner_output=PlannerOutput(**outputs["planner"]) if outputs.get("planner") else None,
        pm_output=PMOutput(**outputs["pm"]) if outputs.get("pm") else None,
        architect_output=ArchitectOutput(**outputs["architect"]) if outputs.get("architect") else None,
        database_output=DatabaseOutput(**outputs["database"]) if outputs.get("database") else None,
        documentation_output=DocumentationOutput(**outputs["documentation"]) if outputs.get("documentation") else None,
        critic_output=outputs.get("critic"),
        improver_output=None,
        current_agent="planner",
        status="running",
        error=None,
    )
    
    try:
        final_state = await graph.ainvoke(initial_state)
        logger.info("STEP A: graph complete")
        
        # Determine score
        critic_out = final_state.get("critic_output", {})
        score = critic_out.get("overall_score", 0) if critic_out else 0
        improver_out = final_state.get("improver_output", {})
        if improver_out:
            score += improver_out.get("expected_score_improvement", 0)
            
        from app.services.embedding_service import embed_project_outputs
        def _dump(output):
            if not output: return None
            return output.model_dump() if hasattr(output, "model_dump") else output
            
        # Delete existing chunks to prevent RAG contamination
        db.table("document_chunks").delete().eq("project_id", project_id).execute()
            
        logger.info("STEP B: embeddings starting")
        await asyncio.to_thread(
            embed_project_outputs,
            project_id,
            _dump(final_state.get("planner_output")),
            _dump(final_state.get("pm_output")),
            _dump(final_state.get("architect_output")),
            _dump(final_state.get("database_output")),
            _dump(final_state.get("documentation_output")),
            _dump(final_state.get("critic_output")),
            _dump(final_state.get("improver_output"))
        )
        logger.info("STEP B DONE: embeddings complete")
        
        logger.info("STEP C: snapshot starting")
        await asyncio.to_thread(snapshot_project_version, db, project_id, score)
        logger.info("STEP C DONE: snapshot complete")
        
        logger.info("STEP D: updating project status")
        queries.update_project_status(db, project_id, "complete")
        logger.info("STEP D DONE: project marked complete")
        
    except asyncio.CancelledError:
        logger.exception("Pipeline cancelled")
        queries.update_project_status(db, project_id, "failed")
        raise
    except Exception:
        logger.exception("Pipeline failed")
        queries.update_project_status(db, project_id, "failed")

async def trigger_evolution_pipeline(project_id: str, change_request: str):
    """
    Executes the evolution pipeline to redesign the system architecture.
    """
    from agents.graph import graph
    from agents.state import GraphState
    from app.services.version_service import snapshot_project_version
    import asyncio
    
    db = db_client.get_supabase_client()
    queries.update_project_status(db, project_id, "running")
    
    project = queries.get_project_by_id(db, project_id)
    runs = queries.get_agent_runs_for_project(db, project_id)
    outputs = {r["agent_name"]: r.get("output") for r in runs}
    
    from agents.state import PlannerOutput, PMOutput, ArchitectOutput, DatabaseOutput, DocumentationOutput
    
    initial_state = GraphState(
        project_id=project_id,
        user_idea=project["description"],
        project_title=project["title"],
        change_request=change_request,
        planner_output=PlannerOutput(**outputs["planner"]) if outputs.get("planner") else None,
        pm_output=PMOutput(**outputs["pm"]) if outputs.get("pm") else None,
        architect_output=ArchitectOutput(**outputs["architect"]) if outputs.get("architect") else None,
        database_output=DatabaseOutput(**outputs["database"]) if outputs.get("database") else None,
        documentation_output=DocumentationOutput(**outputs["documentation"]) if outputs.get("documentation") else None,
        critic_output=outputs.get("critic"),
        evolver_output=None,
        current_agent="evolver",
        status="running",
        error=None,
    )
    
    try:
        final_state = await graph.ainvoke(initial_state)
        logger.info("STEP A: graph complete")
        
        # Determine score
        critic_out = final_state.get("critic_output", {})
        score = critic_out.get("overall_score", 0) if critic_out else 0
        evolver_out = final_state.get("evolver_output", {})
        if evolver_out:
            score += evolver_out.get("expected_score_improvement", 0)
            
        from app.services.embedding_service import embed_project_outputs
        def _dump(output):
            if not output: return None
            return output.model_dump() if hasattr(output, "model_dump") else output
            
        # Delete existing chunks to prevent RAG contamination
        db.table("document_chunks").delete().eq("project_id", project_id).execute()
            
        logger.info("STEP B: embeddings starting")
        await asyncio.to_thread(
            embed_project_outputs,
            project_id,
            _dump(final_state.get("planner_output")),
            _dump(final_state.get("pm_output")),
            _dump(final_state.get("architect_output")),
            _dump(final_state.get("database_output")),
            _dump(final_state.get("documentation_output")),
            _dump(final_state.get("critic_output")),
            _dump(final_state.get("evolver_output"))
        )
        logger.info("STEP B DONE: embeddings complete")
        
        logger.info("STEP C: snapshot starting")
        await asyncio.to_thread(snapshot_project_version, db, project_id, score)
        logger.info("STEP C DONE: snapshot complete")
        
        logger.info("STEP D: updating project status")
        queries.update_project_status(db, project_id, "complete")
        logger.info("STEP D DONE: project marked complete")
        
    except asyncio.CancelledError:
        logger.exception("Pipeline cancelled")
        queries.update_project_status(db, project_id, "failed")
        raise
    except Exception:
        logger.exception("Pipeline failed")
        queries.update_project_status(db, project_id, "failed")
