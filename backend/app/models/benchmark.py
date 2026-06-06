from pydantic import BaseModel

class BenchmarkRequest(BaseModel):
    prompt: str
    providers: list[str]

class BenchmarkResult(BaseModel):
    provider: str
    score: int
    latency_ms: int
    tokens: int
    cost: float
