CREATE TABLE IF NOT EXISTS public.rag_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    chunk_count INTEGER DEFAULT 0,
    average_similarity NUMERIC DEFAULT 0,
    duration_ms INTEGER DEFAULT 0,
    source_agents TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_rag_metrics_project_id ON public.rag_metrics(project_id);
CREATE INDEX IF NOT EXISTS idx_rag_metrics_user_id ON public.rag_metrics(user_id);
