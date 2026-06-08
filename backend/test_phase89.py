import os
import requests
from dotenv import load_dotenv

load_dotenv()

def run_phase89():
    from supabase import create_client
    db = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_SERVICE_ROLE_KEY'])
    
    print("\nPHASE 8: Arena Validation")
    # Fetch 2 projects
    res = db.table("projects").select("id").limit(2).execute()
    if len(res.data) < 2:
        print("Validation: FAIL (Not enough projects for Arena)")
    else:
        pid1 = res.data[0]["id"]
        pid2 = res.data[1]["id"]
        from fastapi.testclient import TestClient
        from app.main import app
        from app.dependencies import get_authenticated_user
        
        uid_res = db.table("users").select("id").limit(1).execute()
        uid = uid_res.data[0]["id"]
        app.dependency_overrides[get_authenticated_user] = lambda: {"clerk_user_id": uid, "email": "audit@test.com", "session_id": "123"}
        client = TestClient(app)
        
        try:
            resp = client.post("/api/v1/arena/compare", json={"project1_id": pid1, "project2_id": pid2})
            print(f"Arena compare status: {resp.status_code}")
            if resp.status_code == 200:
                print("Validation: PASS (Comparison executes)")
            else:
                print(f"Validation: FAIL (Comparison failed: {resp.text})")
        except Exception as e:
            print(f"Validation: FAIL (Exception: {e})")
            
    print("\nPHASE 9: Analytics Validation")
    try:
        resp_stats = client.get("/api/v1/analytics/stats")
        print(f"Analytics stats status: {resp_stats.status_code}")
        if resp_stats.status_code == 200:
            print("Validation: PASS (Dashboard API works)")
            print(resp_stats.json())
        else:
            print(f"Validation: FAIL (Dashboard failed: {resp_stats.text})")
            
        resp_rag = client.get("/api/v1/analytics/rag")
        print(f"Analytics rag status: {resp_rag.status_code}")
        
    except Exception as e:
        print(f"Validation: FAIL (Exception: {e})")

if __name__ == "__main__":
    run_phase89()
