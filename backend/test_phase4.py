import os
import requests
from dotenv import load_dotenv

load_dotenv()

def run_phase4():
    with open("test_pid.txt", "r") as f:
        pid = f.read().strip()
        
    print("PHASE 4: Export Validation")
    
    # We will use python's requests to hit the actual API endpoint
    # Since auth is required, we'll bypass it if we can or mock it.
    # Actually, the export endpoint uses Depends(get_db). We don't have an easy way to hit it via requests without Clerk Auth.
    # Let's mock it using FastAPI TestClient!
    from fastapi.testclient import TestClient
    from app.main import app
    from app.dependencies import get_authenticated_user
    from supabase import create_client
    
    db = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_SERVICE_ROLE_KEY'])
    res = db.table("users").select("id").limit(1).execute()
    uid = res.data[0]["id"]
    
    app.dependency_overrides[get_authenticated_user] = lambda: {"clerk_user_id": uid, "email": "audit@test.com", "session_id": "123"}
    client = TestClient(app)
    
    formats = ["pdf", "markdown", "json", "pptx"]
    for fmt in formats:
        print(f"\n--- Exporting {fmt.upper()} ---")
        try:
            response = client.get(f"/api/v1/projects/{pid}/export?format={fmt}")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                filename = f"export_test_{pid}.{fmt if fmt != 'markdown' else 'md'}"
                with open(filename, "wb") as f:
                    f.write(response.content)
                size = os.path.getsize(filename)
                print(f"File downloaded successfully. Size: {size} bytes")
                if size > 0:
                    print("Validation: PASS (Content is not empty)")
                else:
                    print("Validation: FAIL (Content is empty)")
            else:
                print(f"Failed: {response.text}")
                
        except Exception as e:
            print(f"Validation: FAIL (Exception: {e})")

if __name__ == "__main__":
    run_phase4()
