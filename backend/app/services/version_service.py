import json
from typing import Any, List, Dict, Optional
from supabase import Client
from fastapi import HTTPException, status
from app.db import queries

def snapshot_project_version(db: Client, project_id: str, critic_score: int):
    """Snapshot the current agent outputs into a new project version."""
    agent_runs = queries.get_agent_runs_for_project(db, project_id)
    summary_data = {}
    for run in agent_runs:
        summary_data[run["agent_name"]] = run.get("output")
        
    latest = get_latest_version(db, project_id)
    new_version_number = (latest.get("version_number", 0) + 1) if latest else 1
    parent_id = latest.get("id") if latest else None
    
    db.table("project_versions").insert({
        "project_id": project_id,
        "version_number": new_version_number,
        "parent_version_id": parent_id,
        "summary": json.dumps(summary_data),
        "critic_score": critic_score
    }).execute()
    
def get_latest_version(db: Client, project_id: str) -> Optional[Dict[str, Any]]:
    res = db.table("project_versions").select("*").eq("project_id", project_id).order("version_number", desc=True).limit(1).execute()
    if res.data:
        return res.data[0]
    return None

def list_versions(db: Client, project_id: str) -> List[Dict[str, Any]]:
    res = db.table("project_versions").select("version_number, critic_score, created_at").eq("project_id", project_id).order("version_number", desc=False).execute()
    return [{"version": r["version_number"], "score": r["critic_score"], "created_at": r["created_at"]} for r in res.data]

def compare_versions(db: Client, project_id: str, v1: int, v2: int) -> Dict[str, Any]:
    res = db.table("project_versions").select("*").eq("project_id", project_id).in_("version_number", [v1, v2]).execute()
    versions = {r["version_number"]: r for r in res.data}
    
    if v1 not in versions or v2 not in versions:
        raise HTTPException(status_code=404, detail="Versions not found")
        
    ver1 = versions[v1]
    ver2 = versions[v2]
    
    sum1 = json.loads(ver1.get("summary") or "{}")
    sum2 = json.loads(ver2.get("summary") or "{}")
    
    improver_output = sum2.get("improver", {})
    
    return {
        "v1_score": ver1.get("critic_score"),
        "v2_score": ver2.get("critic_score"),
        "score_delta": (ver2.get("critic_score") or 0) - (ver1.get("critic_score") or 0),
        "security_improvements": improver_output.get("security_improvements", []),
        "scalability_improvements": improver_output.get("scalability_improvements", []),
        "architecture_updates": improver_output.get("architecture_updates", []),
        "database_updates": improver_output.get("database_updates", []),
        "changes_made": improver_output.get("changes_made", [])
    }
