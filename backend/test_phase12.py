import os
import asyncio
import time
from dotenv import load_dotenv

load_dotenv()

async def run_tests():
    from supabase import create_client
    db = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_SERVICE_ROLE_KEY'])
    
    print("PHASE 1: Project Generation")
    
    # Get a user id
    res = db.table("users").select("id").limit(1).execute()
    uid = res.data[0]["id"]
    print("Using User ID:", uid)
    
    # We will just insert directly or use the create_new_project function to simulate the frontend
    from app.services.project_service import create_new_project
    from app.api.v1.projects import ProjectCreate
    
    project_in = ProjectCreate(
        title="Audit Test Project",
        description="A comprehensive testing project for the E2E audit."
    )
    current_user = {"clerk_user_id": uid, "email": "audit@test.com", "session_id": "123"}
    
    class MockBackgroundTasks:
        def add_task(self, func, *args, **kwargs):
            pass # ignored since we replaced it with create_task directly in the code
            
    resp = create_new_project(db, current_user, project_in, MockBackgroundTasks())
    pid = resp.id
    print("Project Created:", pid)
    
    # Wait for completion
    print("Waiting for pipeline to complete...")
    for _ in range(60): # wait up to 5 mins (60 * 5s)
        await asyncio.sleep(5)
        # Re-fetch from db using synchronous client inside asyncio event loop is fine for test script
        r = db.table("projects").select("status").eq("id", pid).execute()
        status = r.data[0]["status"]
        if status in ["complete", "failed"]:
            print(f"Pipeline finished with status: {status}")
            break
        print(f"Status: {status}...")
        
    print("\n--- Phase 1 & 2 Verification ---")
    runs = db.table("agent_runs").select("agent_name,status,output").eq("project_id", pid).execute()
    for run in runs.data:
        has_output = run.get("output") is not None
        print(f"Agent: {run['agent_name']}, Status: {run['status']}, Output Exists: {has_output}")
        
    versions = db.table("project_versions").select("version_number,critic_score,summary").eq("project_id", pid).execute()
    print(f"Versions found: {len(versions.data)}")
    for v in versions.data:
        print(f"Version {v['version_number']} created. Score: {v['critic_score']}")
        
    # Chunks
    chunks = db.table("document_chunks").select("id").eq("project_id", pid).execute()
    print(f"Document chunks created: {len(chunks.data)}")
    
    print("\nWriting Project ID to test_pid.txt for subsequent tests")
    with open("test_pid.txt", "w") as f:
        f.write(pid)

if __name__ == "__main__":
    asyncio.run(run_tests())
