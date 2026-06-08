import asyncio
import os
import logging
from fastapi import BackgroundTasks
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)

async def test_run():
    from app.services.project_service import create_new_project
    from app.db import client as db_client
    from app.api.v1.projects import ProjectCreate
    
    db = db_client.get_supabase_client()
    
    # Let's get an existing user id
    res = db.table("users").select("id").limit(1).execute()
    uid = res.data[0]["id"]
    
    project_in = ProjectCreate(
        title="Background Task Test",
        description="Testing background tasks cancellation"
    )
    
    current_user = {"clerk_user_id": uid, "email": "test@test.com", "session_id": "123"}
    
    # We need to mock the internal user mapping
    from app.db import queries
    
    class MockBackgroundTasks:
        def __init__(self):
            self.tasks = []
        def add_task(self, func, *args, **kwargs):
            self.tasks.append((func, args, kwargs))

    bt = MockBackgroundTasks()
    
    # Call create_new_project
    resp = create_new_project(db, current_user, project_in, bt)
    print("Project created:", resp.id)
    
    # Now simulate what Starlette does: run the background tasks
    for func, args, kwargs in bt.tasks:
        if asyncio.iscoroutinefunction(func):
            # Starlette runs it with await inside an asyncio Task
            # But if the event loop stops or task is cancelled...
            task = asyncio.create_task(func(*args, **kwargs))
            
            # Simulate a client disconnect by cancelling the task after 5 seconds!
            # Wait, does Starlette cancel background tasks on disconnect?
            # As of newer versions it might. Or uvicorn reload cancels it.
            
            # Let's just wait for it.
            await task
            
    r = db.table("projects").select("status").eq("id", resp.id).execute()
    print("Final status:", r.data[0]["status"])

if __name__ == "__main__":
    asyncio.run(test_run())
