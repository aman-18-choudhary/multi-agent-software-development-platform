from fastapi import APIRouter, HTTPException
from app.db import client as db_client

router = APIRouter()

@router.get("/{token}")
async def get_shared_report(token: str):
    db = db_client.get_supabase_client()
    res = db.table("shared_reports").select("*").eq("token", token).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Shared report not found")
        
    share = res.data[0]
    
    db.table("shared_reports").update({"views": share["views"] + 1}).eq("id", share["id"]).execute()
    
    from app.services.export_service import get_project_data
    return get_project_data(db, share["project_id"], share["version_number"])
