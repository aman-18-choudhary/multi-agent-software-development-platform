"""
MASDP LangGraph Pipeline — Nodes.

Defines the individual nodes (agents) in the StateGraph.
"""

import asyncio
import time
import logging
from typing import cast
from pathlib import Path

from agents.state import (
    GraphState,
    PlannerOutput,
    PMOutput,
    ArchitectOutput,
    DatabaseOutput,
    DocumentationOutput,
)
from app.services.agent_service import save_agent_run
from agents.llm_client import generate_structured_json

logger = logging.getLogger(__name__)

PROMPTS_DIR = Path(__file__).resolve().parent.parent / "prompts"


async def run_planner(state: GraphState) -> GraphState:
    project_id = state["project_id"]
    user_idea = state["user_idea"]
    
    logger.info("planner_started", extra={"project_id": project_id})
    await save_agent_run(project_id, "planner", "running")
    start_time = time.time()
    
    try:
        prompt_template = (PROMPTS_DIR / "planner_v1.txt").read_text()
            
        prompt = prompt_template.format(user_idea=user_idea)
        
        parsed_json, prompt_tokens, comp_tokens, model_name = await generate_structured_json(prompt)
        output = PlannerOutput(**parsed_json)
        
        duration_ms = int((time.time() - start_time) * 1000)
        logger.info("planner_completed", extra={"project_id": project_id, "duration_ms": duration_ms})
        
        await save_agent_run(
            project_id=project_id, agent_name="planner", status="complete",
            output=output.model_dump(), duration_ms=duration_ms,
            llm_model=model_name, prompt_tokens=prompt_tokens, completion_tokens=comp_tokens
        )
        return cast(GraphState, {"planner_output": output, "current_agent": "planner"})
        
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        await save_agent_run(project_id, "planner", "failed", duration_ms=duration_ms, error=str(e))
        logger.error("planner_failed", extra={"project_id": project_id, "error": str(e)})
        raise


async def run_pm(state: GraphState) -> GraphState:
    project_id = state["project_id"]
    user_idea = state["user_idea"]
    planner_output = state.get("planner_output")
    
    logger.info("pm_started", extra={"project_id": project_id})
    await save_agent_run(project_id, "pm", "running")
    start_time = time.time()
    
    try:
        prompt_template = (PROMPTS_DIR / "pm_v1.txt").read_text()
            
        planner_json = planner_output.model_dump_json() if planner_output else "{}"
        prompt = prompt_template.format(user_idea=user_idea, planner_output=planner_json)
        
        parsed_json, prompt_tokens, comp_tokens, model_name = await generate_structured_json(prompt)
        output = PMOutput(**parsed_json)
        
        duration_ms = int((time.time() - start_time) * 1000)
        logger.info("pm_completed", extra={"project_id": project_id, "duration_ms": duration_ms})
        
        await save_agent_run(
            project_id=project_id, agent_name="pm", status="complete",
            output=output.model_dump(), duration_ms=duration_ms,
            llm_model=model_name, prompt_tokens=prompt_tokens, completion_tokens=comp_tokens
        )
        return cast(GraphState, {"pm_output": output, "current_agent": "pm"})
        
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        await save_agent_run(project_id, "pm", "failed", duration_ms=duration_ms, error=str(e))
        logger.error("pm_failed", extra={"project_id": project_id, "error": str(e)})
        raise


async def run_architect(state: GraphState) -> GraphState:
    project_id = state["project_id"]
    user_idea = state["user_idea"]
    planner_output = state.get("planner_output")
    pm_output = state.get("pm_output")
    
    logger.info("architect_started", extra={"project_id": project_id})
    await save_agent_run(project_id, "architect", "running")
    start_time = time.time()
    
    try:
        prompt_template = (PROMPTS_DIR / "architect_v1.txt").read_text()
            
        planner_json = planner_output.model_dump_json() if planner_output else "{}"
        pm_json = pm_output.model_dump_json() if pm_output else "{}"
        prompt = prompt_template.format(user_idea=user_idea, planner_output=planner_json, pm_output=pm_json)
        
        parsed_json, prompt_tokens, comp_tokens, model_name = await generate_structured_json(prompt)
        output = ArchitectOutput(**parsed_json)
        
        duration_ms = int((time.time() - start_time) * 1000)
        logger.info("architect_completed", extra={"project_id": project_id, "duration_ms": duration_ms})
        
        await save_agent_run(
            project_id=project_id, agent_name="architect", status="complete",
            output=output.model_dump(), duration_ms=duration_ms,
            llm_model=model_name, prompt_tokens=prompt_tokens, completion_tokens=comp_tokens
        )
        return cast(GraphState, {"architect_output": output, "current_agent": "architect"})
        
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        await save_agent_run(project_id, "architect", "failed", duration_ms=duration_ms, error=str(e))
        logger.error("architect_failed", extra={"project_id": project_id, "error": str(e)})
        raise


async def run_database(state: GraphState) -> GraphState:
    project_id = state["project_id"]
    user_idea = state["user_idea"]
    planner_output = state.get("planner_output")
    pm_output = state.get("pm_output")
    architect_output = state.get("architect_output")
    
    logger.info("database_started", extra={"project_id": project_id})
    await save_agent_run(project_id, "database", "running")
    start_time = time.time()
    
    try:
        prompt_template = (PROMPTS_DIR / "database_v1.txt").read_text()
            
        planner_json = planner_output.model_dump_json() if planner_output else "{}"
        pm_json = pm_output.model_dump_json() if pm_output else "{}"
        architect_json = architect_output.model_dump_json() if architect_output else "{}"
        
        prompt = prompt_template.format(
            user_idea=user_idea,
            planner_output=planner_json,
            pm_output=pm_json,
            architect_output=architect_json
        )
        
        parsed_json, prompt_tokens, comp_tokens, model_name = await generate_structured_json(prompt)
        output = DatabaseOutput(**parsed_json)
        
        duration_ms = int((time.time() - start_time) * 1000)
        logger.info("database_completed", extra={"project_id": project_id, "duration_ms": duration_ms})
        
        await save_agent_run(
            project_id=project_id, agent_name="database", status="complete",
            output=output.model_dump(), duration_ms=duration_ms,
            llm_model=model_name, prompt_tokens=prompt_tokens, completion_tokens=comp_tokens
        )
        return cast(GraphState, {"database_output": output, "current_agent": "database"})
        
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        await save_agent_run(project_id, "database", "failed", duration_ms=duration_ms, error=str(e))
        logger.error("database_failed", extra={"project_id": project_id, "error": str(e)})
        raise


async def run_documentation(state: GraphState) -> GraphState:
    project_id = state["project_id"]
    
    logger.info("documentation_started", extra={"project_id": project_id})
    await save_agent_run(project_id, "documentation", "running")
    start_time = time.time()
    
    try:
        await asyncio.sleep(0.1)
        output = DocumentationOutput(
            readme="# Mock Project\nThis is a mock project README.",
            api_docs="openapi: 3.0.0\ninfo:\n  title: Mock API",
            setup_guide="1. Run mock install\n2. Run mock start"
        )
        
        duration_ms = int((time.time() - start_time) * 1000)
        logger.info("documentation_completed", extra={"project_id": project_id, "duration_ms": duration_ms})
        
        await save_agent_run(project_id, "documentation", "complete", output.model_dump(), duration_ms=duration_ms)
        return cast(GraphState, {"documentation_output": output, "current_agent": "documentation"})
        
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        await save_agent_run(project_id, "documentation", "failed", duration_ms=duration_ms, error=str(e))
        logger.error("documentation_failed", extra={"project_id": project_id, "error": str(e)})
        raise
