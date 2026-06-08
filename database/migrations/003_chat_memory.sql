-- Chat Memory Migration
CREATE TABLE IF NOT EXISTS project_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE, -- NULL means global chat
    user_id UUID NOT NULL,
    chat_type VARCHAR(20) DEFAULT 'project', -- 'project' or 'global'
    role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
    message TEXT NOT NULL,
    metadata JSONB, -- For storing sources/citations
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_chats_project_id ON project_chats(project_id);
CREATE INDEX IF NOT EXISTS idx_project_chats_user_id ON project_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_project_chats_type ON project_chats(chat_type);
