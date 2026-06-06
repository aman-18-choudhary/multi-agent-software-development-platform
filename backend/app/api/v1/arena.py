from fastapi import APIRouter, Depends
from typing import List, Any
from app.auth.clerk import get_current_user
from app.models.benchmark import BenchmarkRequest, BenchmarkResult
from app.services.benchmark_service import run_arena_benchmark
from app.db import client as db_client

router = APIRouter()

@router.post("/run", response_model=List[BenchmarkResult])
async def run_benchmark(
    request: BenchmarkRequest,
    current_user: dict[str, Any] = Depends(get_current_user)
):
    return await run_arena_benchmark(request)

@router.get("/history")
async def get_benchmark_history(
    current_user: dict[str, Any] = Depends(get_current_user)
):
    db = db_client.get_supabase_client()
    res = db.table("model_benchmarks").select("*").order("created_at", desc=True).limit(50).execute()
    return res.data
