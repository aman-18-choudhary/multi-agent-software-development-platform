-- Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the document_chunks table
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    source_agent VARCHAR(100) NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding VECTOR(384), -- 384 dimensions for all-MiniLM-L6-v2
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for filtering
CREATE INDEX IF NOT EXISTS idx_document_chunks_project_id ON document_chunks(project_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_source_agent ON document_chunks(source_agent);

-- Create a function to search for documents
CREATE OR REPLACE FUNCTION match_document_chunks (
  query_embedding VECTOR(384),
  match_count INT DEFAULT 5,
  filter_project_id UUID DEFAULT NULL
) RETURNS TABLE (
  id UUID,
  project_id UUID,
  source_agent VARCHAR,
  chunk_text TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.project_id,
    dc.source_agent,
    dc.chunk_text,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  WHERE filter_project_id IS NULL OR dc.project_id = filter_project_id
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
