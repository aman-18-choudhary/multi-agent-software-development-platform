"""
MASDP Backend — Database Queries.

Reusable database operations wrapping the Supabase client.
"""

import logging
from typing import Any, Optional

from supabase import Client

logger = logging.getLogger(__name__)


def get_user_by_clerk_id(db: Client, clerk_id: str) -> Optional[dict[str, Any]]:
    """Retrieve an internal user row by their Clerk ID."""
    response = db.table("users").select("*").eq("clerk_id", clerk_id).maybe_single().execute()
    return response.data


def create_user(db: Client, clerk_id: str, email: str) -> dict[str, Any]:
    """Create or update an internal user record from a Clerk login."""
    response = db.table("users").upsert({
        "clerk_id": clerk_id,
        "email": email,
    }, on_conflict="clerk_id").execute()
    return response.data[0]


def insert_project(db: Client, user_id: str, title: str, description: str) -> dict[str, Any]:
    """Insert a new project row."""
    response = db.table("projects").insert({
        "user_id": user_id,
        "title": title,
        "description": description,
        "status": "pending",
    }).execute()
    return response.data[0]


def insert_agent_run(db: Client, project_id: str, agent_name: str, status: str) -> dict[str, Any]:
    """Insert a new agent run row."""
    response = db.table("agent_runs").insert({
        "project_id": project_id,
        "agent_name": agent_name,
        "status": status,
    }).execute()
    return response.data[0]


def get_projects_by_user(db: Client, user_id: str, limit: int = 10, offset: int = 0) -> tuple[list[dict[str, Any]], int]:
    """Retrieve a paginated list of projects for a user."""
    # First get the count
    count_response = db.table("projects").select("id", count="exact").eq("user_id", user_id).execute()
    total = count_response.count if count_response.count is not None else 0

    # Then get the data
    response = db.table("projects").select(
        "id, title, status, created_at, completed_at"
    ).eq("user_id", user_id).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    
    return response.data, total


def get_project_by_id(db: Client, project_id: str) -> Optional[dict[str, Any]]:
    """Retrieve a single project."""
    response = db.table("projects").select("*").eq("id", project_id).maybe_single().execute()
    return response.data


def get_agent_runs_for_project(db: Client, project_id: str) -> list[dict[str, Any]]:
    """Retrieve all agent runs for a specific project."""
    response = db.table("agent_runs").select("*").eq("project_id", project_id).order("created_at").execute()
    return response.data


def delete_project(db: Client, project_id: str) -> None:
    """Delete a project. Cascade deletes agent_runs."""
    db.table("projects").delete().eq("id", project_id).execute()


def update_agent_run(db: Client, project_id: str, agent_name: str, status: str, output: Optional[dict] = None, duration_ms: Optional[int] = None, llm_model: Optional[str] = None, prompt_tokens: Optional[int] = None, completion_tokens: Optional[int] = None, error: Optional[str] = None) -> None:
    """Update the status and output of an agent run, including LLM metrics and errors."""
    from datetime import datetime, timezone
    update_data = {"status": status}
    
    if status in ("complete", "failed"):
        update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
        
    if output is not None:
        update_data["output"] = output
    if duration_ms is not None:
        update_data["duration_ms"] = duration_ms
    if llm_model is not None:
        update_data["llm_model"] = llm_model
    if prompt_tokens is not None:
        update_data["prompt_tokens"] = prompt_tokens
    if completion_tokens is not None:
        update_data["completion_tokens"] = completion_tokens
    if error is not None:
        update_data["error_message"] = error
        
    db.table("agent_runs").update(update_data).eq("project_id", project_id).eq("agent_name", agent_name).execute()


def update_project_status(db: Client, project_id: str, status: str) -> None:
    """Update the overall status of a project."""
    from datetime import datetime, timezone
    update_data = {"status": status}
    if status == "complete":
        update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
        
    db.table("projects").update(update_data).eq("id", project_id).execute()
