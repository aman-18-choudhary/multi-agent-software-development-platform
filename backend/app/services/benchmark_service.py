import time
import asyncio
import logging
from typing import List

from app.db import client as db_client
from agents.graph import graph
from agents.state import GraphState
from app.models.benchmark import BenchmarkRequest, BenchmarkResult

logger = logging.getLogger(__name__)

COST_RATES = {
    "groq": {"prompt": 0.00005 / 1000, "completion": 0.00008 / 1000},
    "openai": {"prompt": 0.00015 / 1000, "completion": 0.00060 / 1000},
    "anthropic": {"prompt": 0.00025 / 1000, "completion": 0.00125 / 1000},
    "gemini": {"prompt": 0.000075 / 1000, "completion": 0.00030 / 1000},
}

async def run_provider_benchmark(provider: str, prompt: str) -> BenchmarkResult:
    logger.info(f"Starting benchmark for {provider}")
    
    initial_state = GraphState(
        project_id="benchmark",
        user_idea=prompt,
        project_title="Benchmark Run",
        planner_output=None,
        pm_output=None,
        architect_output=None,
        database_output=None,
        documentation_output=None,
        critic_output=None,
        improver_output=None,
        improvement_goal=None,
        current_agent="planner",
        status="running",
        error=None,
        llm_provider=provider,
        is_benchmark=True,
        total_prompt_tokens=0,
        total_completion_tokens=0
    )
    
    start_time = time.time()
    
    try:
        final_state = await graph.ainvoke(initial_state)
        latency_ms = int((time.time() - start_time) * 1000)
        
        critic_out = final_state.get("critic_output", {})
        score = critic_out.get("overall_score", 0) if critic_out else 0
        
        pt = final_state.get("total_prompt_tokens", 0)
        ct = final_state.get("total_completion_tokens", 0)
        total_tokens = pt + ct
        
        rates = COST_RATES.get(provider, {"prompt": 0, "completion": 0})
        cost = (pt * rates["prompt"]) + (ct * rates["completion"])
        
        output_payload = {
            "planner": final_state.get("planner_output").model_dump() if final_state.get("planner_output") else None,
            "pm": final_state.get("pm_output").model_dump() if final_state.get("pm_output") else None,
            "architect": final_state.get("architect_output").model_dump() if final_state.get("architect_output") else None,
            "database": final_state.get("database_output").model_dump() if final_state.get("database_output") else None,
            "documentation": final_state.get("documentation_output").model_dump() if final_state.get("documentation_output") else None,
        }
        
        db = db_client.get_supabase_client()
        db.table("model_benchmarks").insert({
            "provider": provider,
            "prompt": prompt,
            "score": score,
            "latency_ms": latency_ms,
            "token_usage": total_tokens,
            "estimated_cost": cost,
            "output": output_payload,
            "critic_output": critic_out
        }).execute()
        
        return BenchmarkResult(
            provider=provider,
            score=score,
            latency_ms=latency_ms,
            tokens=total_tokens,
            cost=cost
        )
        
    except Exception as e:
        logger.error(f"Benchmark failed for {provider}: {e}")
        latency_ms = int((time.time() - start_time) * 1000)
        
        failing_agent = "unknown"
        import traceback
        tb = traceback.format_exc()
        error_str = str(e)
        
        import re
        match = re.search(r"node '([^']+)'", error_str)
        if match:
            failing_agent = match.group(1)
            
        raw_response_excerpt = None
        if "Raw Response Excerpt:" in error_str:
            parts = error_str.split("Raw Response Excerpt:")
            error_str = parts[0].strip()
            raw_response_excerpt = parts[1].strip()
            
        db = db_client.get_supabase_client()
        db.table("model_benchmarks").insert({
            "provider": provider,
            "prompt": prompt,
            "score": 0,
            "latency_ms": latency_ms,
            "token_usage": 0,
            "estimated_cost": 0,
            "output": {
                "error": error_str,
                "traceback": tb,
                "failing_agent": failing_agent,
                "raw_response_excerpt": raw_response_excerpt
            },
            "critic_output": {}
        }).execute()
        
        return BenchmarkResult(
            provider=provider,
            score=0,
            latency_ms=latency_ms,
            tokens=0,
            cost=0.0
        )

async def run_arena_benchmark(request: BenchmarkRequest) -> List[BenchmarkResult]:
    # Run all providers sequentially to avoid local machine throttling / rate limits on free tiers
    # Wait, the user might want parallel. Let's do parallel but with a small concurrency limit or just gather.
    # Actually, asyncio.gather is fine.
    
    tasks = [run_provider_benchmark(provider, request.prompt) for provider in request.providers]
    results = await asyncio.gather(*tasks)
    
    # Sort results by score descending
    results.sort(key=lambda x: x.score, reverse=True)
    return results
