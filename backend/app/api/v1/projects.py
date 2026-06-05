"""
MASDP Backend — Projects Router.

Endpoints for managing user projects (CRUD).
"""

from typing import Any

from fastapi import APIRouter, Depends, Query, status, BackgroundTasks
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
