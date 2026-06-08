-- RAG Metrics Migration
CREATE TABLE IF NOT EXISTS rag_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE, -- NULL means global
    query TEXT NOT NULL,
    chunks_retrieved INT DEFAULT 0,
    avg_similarity FLOAT DEFAULT 0.0,
    response_time_ms INT DEFAULT 0,
    source_agents JSONB, -- Array of source agent names
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rag_metrics_user_id ON rag_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_rag_metrics_project_id ON rag_metrics(project_id);
