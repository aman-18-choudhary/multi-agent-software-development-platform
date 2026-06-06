"""
MASDP Backend — Analytics API Router.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any

from app.auth.clerk import get_current_user
from app.db import client as db_client
from app.services.project_service import _ensure_internal_user
from app.services.rag_metrics_service import get_rag_analytics

router = APIRouter()

@router.get("")
async def fetch_analytics(
    current_user: dict[str, Any] = Depends(get_current_user)
):
    """Retrieves aggregated RAG analytics for the user's dashboard."""
    db = db_client.get_supabase_client()
    internal_user_id = _ensure_internal_user(db, current_user)
    
    try:
        data = get_rag_analytics(db, internal_user_id)
        return data
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/quality")
async def fetch_quality_analytics(
    current_user: dict[str, Any] = Depends(get_current_user)
):
    """Retrieves quality metrics based on Critic agent outputs."""
    db = db_client.get_supabase_client()
    from app.db import queries
    internal_user_id = _ensure_internal_user(db, current_user)
    
    try:
        projects_data, _ = queries.get_projects_by_user(db, internal_user_id, limit=1000)
        if not projects_data:
            return {}
            
        project_ids = [p["id"] for p in projects_data]
        project_map = {p["id"]: p["title"] for p in projects_data}
        
        runs = db.table("agent_runs").select("*").in_("project_id", project_ids).eq("agent_name", "critic").execute()
        
        if not runs.data:
            return {}
            
        scores = []
        weaknesses = {}
        security = {}
        highest_score = -1
        highest_project = None
        lowest_score = 101
        lowest_project = None
        
        for r in runs.data:
            output = r.get("output", {})
            if not output: continue
            
            score = output.get("overall_score", 0)
            pid = r["project_id"]
            ptitle = project_map.get(pid, "Unknown")
            
            scores.append(score)
            if score > highest_score:
                highest_score = score
                highest_project = ptitle
            if score < lowest_score:
                lowest_score = score
                lowest_project = ptitle
                
            for w in output.get("weaknesses", []):
                weaknesses[w] = weaknesses.get(w, 0) + 1
            for s in output.get("security_concerns", []):
                security[s] = security.get(s, 0) + 1
                
        if not scores: return {}
        
        avg_score = sum(scores) / len(scores)
        
        top_weaknesses = [{"label": k, "count": v} for k, v in sorted(weaknesses.items(), key=lambda x: x[1], reverse=True)[:5]]
        top_security = [{"label": k, "count": v} for k, v in sorted(security.items(), key=lambda x: x[1], reverse=True)[:5]]
        
        # Version Iteration Metrics
        versions = db.table("project_versions").select("*").in_("project_id", project_ids).execute()
        avg_score_improvement = 0
        iterations_per_project = 0
        common_improvements = {}
        
        if versions.data:
            proj_versions = {}
            import json
            improvements = []
            
            for v in versions.data:
                pid = v["project_id"]
                proj_versions[pid] = proj_versions.get(pid, 0) + 1
                
                sum_data = json.loads(v.get("summary") or "{}")
                if "improver" in sum_data and sum_data["improver"]:
                    imp = sum_data["improver"].get("expected_score_improvement", 0)
                    improvements.append(imp)
                    for change in sum_data["improver"].get("changes_made", []):
                        common_improvements[change] = common_improvements.get(change, 0) + 1
            
            iterations = [c for c in proj_versions.values() if c > 0]
            iterations_per_project = (sum(iterations) / len(proj_versions)) if proj_versions else 0
            avg_score_improvement = (sum(improvements) / len(improvements)) if improvements else 0
            
        top_improvements = [{"label": k, "count": v} for k, v in sorted(common_improvements.items(), key=lambda x: x[1], reverse=True)[:5]]
        
        exports = db.table("export_events").select("*").in_("project_id", project_ids).execute()
        shares = db.table("shared_reports").select("*").in_("project_id", project_ids).execute()
        export_count = len(exports.data) if exports.data else 0
        share_count = len(shares.data) if shares.data else 0
        most_downloaded = "None"
        if exports.data:
            formats = {}
            for e in exports.data:
                f = e.get("export_format")
                formats[f] = formats.get(f, 0) + 1
            most_downloaded = max(formats.items(), key=lambda x: x[1])[0] if formats else "None"
        
        return {
            "average_score": avg_score,
            "highest_score": highest_score,
            "highest_project": highest_project,
            "lowest_score": lowest_score,
            "lowest_project": lowest_project,
            "common_weaknesses": top_weaknesses,
            "common_security_issues": top_security,
            "average_score_improvement": avg_score_improvement,
            "average_iterations": iterations_per_project,
            "common_improvements": top_improvements,
            "export_count": export_count,
            "share_count": share_count,
            "most_downloaded_format": most_downloaded
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/models")
async def fetch_model_analytics(
    current_user: dict[str, Any] = Depends(get_current_user)
):
    """Retrieves analytics based on benchmark runs."""
    db = db_client.get_supabase_client()
    try:
        runs = db.table("model_benchmarks").select("*").execute()
        if not runs.data:
            return {}
        
        provider_stats = {}
        for r in runs.data:
            p = r["provider"]
            if p not in provider_stats:
                provider_stats[p] = {"count": 0, "score": 0, "latency": 0, "cost": 0, "tokens": 0}
            provider_stats[p]["count"] += 1
            provider_stats[p]["score"] += r.get("score", 0)
            provider_stats[p]["latency"] += r.get("latency_ms", 0)
            provider_stats[p]["cost"] += float(r.get("estimated_cost", 0))
            provider_stats[p]["tokens"] += r.get("token_usage", 0)
            
        summary = []
        best_cloud = None
        best_local = None
        
        for p, s in provider_stats.items():
            c = s["count"]
            avg_score = s["score"] / c
            avg_lat = s["latency"] / c
            type_val = "local" if p == "ollama" else "cloud"
            
            summary.append({
                "provider": p,
                "type": type_val,
                "avg_score": avg_score,
                "avg_latency_ms": avg_lat,
                "avg_tokens": s["tokens"] / c,
                "runs": c
            })
            
            if type_val == "cloud":
                if not best_cloud or avg_score > best_cloud["value"]: best_cloud = {"provider": p, "value": avg_score}
            else:
                if not best_local or avg_score > best_local["value"]: best_local = {"provider": p, "value": avg_score}
            
        return {
            "providers": summary,
            "best_cloud_model": best_cloud["provider"] if best_cloud else "N/A",
            "best_local_model": best_local["provider"] if best_local else "N/A"
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
