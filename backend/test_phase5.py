import os
import requests
from dotenv import load_dotenv

load_dotenv()

def run_phase5():
    with open("test_pid.txt", "r") as f:
        pid = f.read().strip()
        
    print("PHASE 5: Share Validation")
    from fastapi.testclient import TestClient
    from app.main import app
    from app.dependencies import get_authenticated_user
    from supabase import create_client
    
    db = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_SERVICE_ROLE_KEY'])
    res = db.table("users").select("id").limit(1).execute()
    uid = res.data[0]["id"]
    
    app.dependency_overrides[get_authenticated_user] = lambda: {"clerk_user_id": uid, "email": "audit@test.com", "session_id": "123"}
    client = TestClient(app)
    
    print("\n--- Generating Share Link ---")
    response = client.post(f"/api/v1/projects/{pid}/share")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        share_token = data.get("share_token")
        share_url = data.get("share_url")
        print(f"Share Token: {share_token}")
        print(f"Share URL: {share_url}")
        
        # Verify row created
        db_res = db.table("shared_reports").select("*").eq("share_token", share_token).execute()
        if db_res.data:
            print("Validation: PASS (shared_reports row created)")
        else:
            print("Validation: FAIL (shared_reports row not found)")
            
        # Verify public URL works without auth
        app.dependency_overrides = {} # remove auth override
        client = TestClient(app)
        
        pub_response = client.get(f"/api/v1/share/{share_token}")
        print(f"Public URL Status: {pub_response.status_code}")
        if pub_response.status_code == 200:
            print("Validation: PASS (Public URL works)")
            pub_data = pub_response.json()
            if pub_data.get("project_id") == pid:
                print("Validation: PASS (Shared content rendered correctly)")
            else:
                print("Validation: FAIL (Shared content mismatch)")
        else:
            print("Validation: FAIL (Public URL failed)")
            
    else:
        print(f"Failed to generate share link: {response.text}")

if __name__ == "__main__":
    run_phase5()
