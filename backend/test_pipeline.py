import asyncio
import logging
import uuid
from app.db import client as db_client
from app.db import queries
from app.services.agent_service import trigger_pipeline

logging.basicConfig(level=logging.INFO)

async def test():
    db = db_client.get_supabase_client()
    users = db.table("users").select("*").limit(1).execute()
    user_id = users.data[0]["id"] if users.data else str(uuid.uuid4())
    if not users.data:
        db.table("users").insert({"id": user_id, "clerk_id": "test", "email": "test@test.com"}).execute()
        
    project = queries.insert_project(db, user_id, "Food Delivery App", "Build a food delivery app like UberEats.")
    project_id = project["id"]
    
    agents_to_init = ["planner", "pm", "architect", "database", "documentation"]
    for agent_name in agents_to_init:
        queries.insert_agent_run(db, project_id, agent_name, "queued")
        
    print(f"Triggering pipeline for {project_id}...")
    await trigger_pipeline(project_id, "Build a food delivery app like UberEats.", "Food Delivery App")
    print("Pipeline complete!")

asyncio.run(test())
