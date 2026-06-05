"""
MASDP Backend — Project Service.

Business logic for managing projects. Handles authorization checks,
transaction-like operations, and data transformations.
"""

from typing import Any
import logging

from fastapi import HTTPException, status, BackgroundTasks
from supabase import Client

from app.db import queries
from app.services import agent_service
from app.models.project import (
    ProjectCreate,
    ProjectCreateResponse,
    ProjectListResponse,
    ProjectDetailResponse,
)

logger = logging.getLogger(__name__)


def _ensure_internal_user(db: Client, current_user: dict[str, Any]) -> str:
    """Ensure the Clerk user exists in our internal DB, returning the internal user_id."""
    clerk_id = current_user["clerk_user_id"]
    email = current_user.get("email", "")
    
    user = queries.create_user(db, clerk_id, email)
    return user["id"]


def create_new_project(db: Client, current_user: dict[str, Any], project_in: ProjectCreate, background_tasks: BackgroundTasks) -> ProjectCreateResponse:
    """Create a new project and initialize its agent runs."""
    internal_user_id = _ensure_internal_user(db, current_user)

    # 1. Create the project
    project = queries.insert_project(db, internal_user_id, project_in.title, project_in.description)
    
    # 2. Initialize agent runs in 'queued' state
    # (Planner starts immediately as 'running' in the full pipeline, but we just init here)
    agents_to_init = ["planner", "pm", "architect", "database", "documentation"]
    agent_responses = []
    
    for agent_name in agents_to_init:
        agent_status = "queued"
        queries.insert_agent_run(db, project["id"], agent_name, agent_status)
        agent_responses.append({"name": agent_name, "status": agent_status})

    # Trigger the LangGraph pipeline asynchronously
    background_tasks.add_task(
        agent_service.trigger_pipeline, 
        project_id=project["id"], 
        user_idea=project_in.description, 
        project_title=project_in.title
    )

    return ProjectCreateResponse(
        id=project["id"],
        title=project["title"],
        status=project["status"],
        created_at=project["created_at"],
        agents=agent_responses
    )


def list_user_projects(db: Client, current_user: dict[str, Any], page: int = 1, limit: int = 10) -> ProjectListResponse:
    """Retrieve a paginated list of the user's projects."""
    internal_user_id = _ensure_internal_user(db, current_user)
    offset = (page - 1) * limit

    projects_data, total = queries.get_projects_by_user(db, internal_user_id, limit, offset)

    return ProjectListResponse(
        projects=projects_data,
        total=total,
        page=page
    )


def get_full_project_detail(db: Client, current_user: dict[str, Any], project_id: str) -> ProjectDetailResponse:
    """Retrieve full project details, checking ownership."""
    internal_user_id = _ensure_internal_user(db, current_user)
    
    project = queries.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        
    if project["user_id"] != internal_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Fetch agent runs
    agent_runs = queries.get_agent_runs_for_project(db, project_id)
    
    # For Day 2 MVP, documents are an empty list (added in Week 2 RAG/Docs)
    documents = []

    return ProjectDetailResponse(
        id=project["id"],
        title=project["title"],
        description=project["description"],
        status=project["status"],
        created_at=project["created_at"],
        completed_at=project["completed_at"],
        agents=agent_runs,
        documents=documents
    )


def delete_user_project(db: Client, current_user: dict[str, Any], project_id: str) -> None:
    """Delete a user's project, checking ownership."""
    internal_user_id = _ensure_internal_user(db, current_user)
    
    project = queries.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        
    if project["user_id"] != internal_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    queries.delete_project(db, project_id)
