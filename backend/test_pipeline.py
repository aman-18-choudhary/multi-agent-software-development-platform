import asyncio
import os
import logging
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)

async def test_run():
    from app.services.agent_service import trigger_pipeline
    from app.db import client as db_client
    from app.db import queries
    
    db = db_client.get_supabase_client()
    
    # Let's get an existing user id to satisfy foreign key constraints.
    res = db.table("users").select("id").limit(1).execute()
    uid = res.data[0]["id"]
    
    # 1. create dummy project
    project = queries.insert_project(db, uid, "Test Bug", "Test Description")
    pid = project["id"]
    print("Project ID:", pid)
    
    # 2. init agents
    for agent_name in ["planner", "pm", "architect", "database", "documentation", "critic"]:
        queries.insert_agent_run(db, pid, agent_name, "queued")
        
    # 3. trigger pipeline
    print("Triggering pipeline...")
    await trigger_pipeline(pid, "Test Description", "Test Bug")
    print("Pipeline completed synchronously in test.")
    
    # 4. Check status
    r = db.table("projects").select("status").eq("id", pid).execute()
    print("Final status:", r.data[0]["status"])

if __name__ == "__main__":
    asyncio.run(test_run())
