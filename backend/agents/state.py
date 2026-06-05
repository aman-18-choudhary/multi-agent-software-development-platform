"""
MASDP LangGraph Pipeline — State Definition.

Defines the state passed between agents and the output schemas
for each agent's execution.
"""

from typing import List, Optional, TypedDict
from pydantic import BaseModel, Field


# -----------------------------------------------------------------------------
# Agent Output Schemas
# -----------------------------------------------------------------------------

class PlannerOutput(BaseModel):
    functional_requirements: List[str] = Field(default_factory=list)
    non_functional_requirements: List[str] = Field(default_factory=list)
    user_stories: List[str] = Field(default_factory=list)
    out_of_scope: List[str] = Field(default_factory=list)
    assumptions: List[str] = Field(default_factory=list)


class PMOutput(BaseModel):
    project_scope: str = ""
    milestones: List[str] = Field(default_factory=list)
    risk_register: List[str] = Field(default_factory=list)
    acceptance_criteria: List[str] = Field(default_factory=list)
    estimated_effort_days: int = 0


class ArchitectOutput(BaseModel):
    system_design: str = ""
    tech_stack: List[str] = Field(default_factory=list)
    architecture_diagram: str = ""


class DatabaseOutput(BaseModel):
    schema_design: str = ""
    tables: List[str] = Field(default_factory=list)
    er_diagram: str = ""
    sql_ddl: str = ""


class DocumentationOutput(BaseModel):
    readme: str = ""
    api_docs: str = ""
    setup_guide: str = ""


# -----------------------------------------------------------------------------
# Graph State
# -----------------------------------------------------------------------------

class GraphState(TypedDict):
    """The central state of the LangGraph execution."""
    
    # Input
    project_id: str
    user_idea: str
    project_title: str
    
    # Agent Outputs (accumulated along the graph)
    planner_output: Optional[PlannerOutput]
    pm_output: Optional[PMOutput]
    architect_output: Optional[ArchitectOutput]
    database_output: Optional[DatabaseOutput]
    documentation_output: Optional[DocumentationOutput]
    
    # Control / Telemetry
    current_agent: str
    status: str
    error: Optional[str]
