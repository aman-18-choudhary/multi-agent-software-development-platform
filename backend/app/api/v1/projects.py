"""
MASDP Backend — Projects Router.

Endpoints for managing user projects (CRUD).
"""

from typing import Any

from fastapi import APIRouter, Depends, Query, status, BackgroundTasks, HTTPException
from supabase import Client

from app.dependencies import get_authenticated_user, get_db
from app.models.project import (
    ProjectCreate,
    ProjectCreateResponse,
    ProjectListResponse,
    ProjectDetailResponse,
)
from app.services import project_service

router = APIRouter()


@router.post("/", response_model=ProjectCreateResponse, status_code=status.HTTP_202_ACCEPTED)
async def create_project(
    project_in: ProjectCreate,
    background_tasks: BackgroundTasks,
    current_user: dict[str, Any] = Depends(get_authenticated_user),
    db: Client = Depends(get_db),
):
    """
    Create a new project and initialize its agent pipeline.
    Returns 202 Accepted.
    """
    return project_service.create_new_project(db, current_user, project_in, background_tasks)


@router.get("/", response_model=ProjectListResponse)
async def get_projects(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    current_user: dict[str, Any] = Depends(get_authenticated_user),
    db: Client = Depends(get_db),
):
    """
    List all projects for the authenticated user with pagination.
    """
    return project_service.list_user_projects(db, current_user, page=page, limit=limit)


@router.get("/{project_id}", response_model=ProjectDetailResponse)
async def get_project(
    project_id: str,
    current_user: dict[str, Any] = Depends(get_authenticated_user),
    db: Client = Depends(get_db),
):
    """
    Get full project details, including all agent outputs.
    Checks ownership before returning data.
    """
    return project_service.get_full_project_detail(db, current_user, project_id)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    current_user: dict[str, Any] = Depends(get_authenticated_user),
    db: Client = Depends(get_db),
):
    """
    Delete a project and all associated data.
    """
    project_service.delete_user_project(db, current_user, project_id)

from pydantic import BaseModel
class ImprovementRequest(BaseModel):
    goal: str

@router.post("/{project_id}/versions", status_code=status.HTTP_202_ACCEPTED)
async def create_project_version(
    project_id: str,
    request: ImprovementRequest,
    background_tasks: BackgroundTasks,
    current_user: dict[str, Any] = Depends(get_authenticated_user),
    db: Client = Depends(get_db),
):
    """Trigger a new architecture iteration."""
    from app.services.agent_service import trigger_iteration_pipeline
    from app.services.version_service import get_latest_version
    
    background_tasks.add_task(trigger_iteration_pipeline, project_id=project_id, improvement_goal=request.goal)
    latest = get_latest_version(db, project_id)
    new_version = (latest.get("version_number", 0) + 1) if latest else 2
    return {"version": new_version, "status": "running"}

@router.get("/{project_id}/versions")
async def list_project_versions(
    project_id: str,
    current_user: dict[str, Any] = Depends(get_authenticated_user),
    db: Client = Depends(get_db),
):
    from app.services.version_service import list_versions
    return list_versions(db, project_id)

@router.get("/{project_id}/versions/compare")
async def compare_project_versions(
    project_id: str,
    v1: int = Query(...),
    v2: int = Query(...),
    current_user: dict[str, Any] = Depends(get_authenticated_user),
    db: Client = Depends(get_db),
):
    from app.services.version_service import compare_versions
    return compare_versions(db, project_id, v1, v2)

from fastapi.responses import Response
import secrets
from app.services.project_service import _ensure_internal_user
from app.db import queries

@router.get("/{project_id}/export/{format}")
async def export_project(
    project_id: str,
    format: str,
    version: int = Query(None),
    current_user: dict[str, Any] = Depends(get_authenticated_user),
    db: Client = Depends(get_db),
):
    from app.services.export_service import export_pdf, export_markdown, export_json, export_pptx
    
    internal_user_id = _ensure_internal_user(db, current_user)
    project = queries.get_project_by_id(db, project_id)
    if not project or project["user_id"] != internal_user_id:
        raise HTTPException(status_code=403, detail="Access denied")
        
    db.table("export_events").insert({
        "project_id": project_id,
        "export_format": format
    }).execute()
    
    if format == "pdf":
        data = export_pdf(db, project_id, version)
        return Response(content=data, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=project_{project_id}.pdf"})
    elif format == "markdown":
        data = export_markdown(db, project_id, version)
        return Response(content=data, media_type="application/zip", headers={"Content-Disposition": f"attachment; filename=project_{project_id}.zip"})
    elif format == "json":
        data = export_json(db, project_id, version)
        return Response(content=data, media_type="application/json", headers={"Content-Disposition": f"attachment; filename=project_{project_id}.json"})
    elif format == "pptx":
        data = export_pptx(db, project_id, version)
        return Response(content=data, media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation", headers={"Content-Disposition": f"attachment; filename=project_{project_id}.pptx"})
    else:
        raise HTTPException(status_code=400, detail="Invalid format")

@router.post("/{project_id}/share")
async def create_share_link(
    project_id: str,
    version: int = Query(None),
    current_user: dict[str, Any] = Depends(get_authenticated_user),
    db: Client = Depends(get_db),
):
    internal_user_id = _ensure_internal_user(db, current_user)
    project = queries.get_project_by_id(db, project_id)
    if not project or project["user_id"] != internal_user_id:
        raise HTTPException(status_code=403, detail="Access denied")
        
    token = secrets.token_urlsafe(16)
    db.table("shared_reports").insert({
        "project_id": project_id,
        "version_number": version,
        "token": token
    }).execute()
    
    return {"token": token, "url": f"/share/{token}"}
