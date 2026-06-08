/**
 * MASDP Frontend — Project Types.
 * 
 * TypeScript definitions matching the backend Pydantic models.
 */

export interface AgentRunStub {
  name: string;
  status: string;
}

export interface ProjectCreateResponse {
  id: string;
  title: string;
  status: string;
  created_at: string;
  agents: AgentRunStub[];
}

export interface ProjectResponse {
  id: string;
  title: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  quality_score?: number;
}

export interface ProjectListResponse {
  projects: ProjectResponse[];
  total: number;
  page: number;
}

export interface AgentRunDetail {
  name: string;
  status: string;
  output: Record<string, any> | null;
  duration_ms: number | null;
  llm_model: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  completed_at: string | null;
}

export interface DocumentStub {
  id: string;
  doc_type: string;
  title: string;
  content: string;
}

export interface ProjectDetailResponse {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  agents: AgentRunDetail[];
  documents: DocumentStub[];
}
