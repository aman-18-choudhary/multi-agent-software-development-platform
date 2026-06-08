import os
import json
import logging
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)

def test_api():
    from fastapi.testclient import TestClient
    from app.main import app
    from app.dependencies import get_authenticated_user
    from app.db import client as db_client
    
    db = db_client.get_supabase_client()
    res = db.table("users").select("id").limit(1).execute()
    uid = res.data[0]["id"]
    
    # Mock auth
    app.dependency_overrides[get_authenticated_user] = lambda: {"clerk_user_id": uid, "email": "test@test.com", "session_id": "123"}
    
    client = TestClient(app)
    
    print("Sending POST request to create project...")
    response = client.post(
        "/api/v1/projects/",
        json={"title": "Test FastAPI Client", "description": "Testing if BackgroundTasks cancels."}
    )
    
    print("Response status:", response.status_code)
    data = response.json()
    print("Response JSON:", data)
    pid = data["id"]
    
    print("Waiting 10 seconds for background tasks (TestClient blocks on background tasks internally anyway)")
    # TestClient in Starlette ACTUALLY BLOCKS until BackgroundTasks are complete!
    
    r = db.table("projects").select("status").eq("id", pid).execute()
    print("Final status in DB:", r.data[0]["status"])

if __name__ == "__main__":
    test_api()
