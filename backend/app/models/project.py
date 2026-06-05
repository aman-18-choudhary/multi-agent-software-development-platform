"""
MASDP Backend — Project Models.

Pydantic models for project-related API requests and responses.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, ConfigDict


class ProjectCreate(BaseModel):
    """Schema for creating a new project."""
    title: str = Field(..., min_length=1, max_length=500)
    description: str = Field(..., min_length=20)


class AgentRunStub(BaseModel):
    """Stub for agent runs in the project creation response."""
    name: str
    status: str


class ProjectCreateResponse(BaseModel):
    """Response returned when a project is accepted for creation."""
    id: str
    title: str
    status: str
    created_at: datetime
    agents: List[AgentRunStub]


class ProjectResponse(BaseModel):
    """Schema for a standard project list item."""
    id: str
    title: str
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None


class ProjectListResponse(BaseModel):
    """Paginated list of projects."""
    projects: List[ProjectResponse]
    total: int
    page: int


class AgentRunDetail(BaseModel):
    """Detail for an agent run in the project payload."""
    name: str
    status: str
    output: Optional[dict] = None
    duration_ms: Optional[int] = None
    llm_model: Optional[str] = None
    completed_at: Optional[datetime] = None


class DocumentStub(BaseModel):
    """Stub for a document in the project detail payload."""
    id: str
    doc_type: str
    title: str
    content: str


class ProjectDetailResponse(BaseModel):
    """Full detail of a project including its agent runs and documents."""
    id: str
    title: str
    description: str
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    agents: List[AgentRunDetail]
    documents: List[DocumentStub]
