CREATE TABLE model_benchmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(50),
    prompt TEXT,
    score INTEGER,
    latency_ms INTEGER,
    token_usage INTEGER,
    estimated_cost NUMERIC,
    output JSONB,
    critic_output JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
