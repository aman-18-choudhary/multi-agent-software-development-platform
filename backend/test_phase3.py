import os
import asyncio
from dotenv import load_dotenv

load_dotenv()

def run_phase3():
    from supabase import create_client
    db = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_SERVICE_ROLE_KEY'])
    
    with open("test_pid.txt", "r") as f:
        pid = f.read().strip()
        
    print(f"PHASE 3: RAG Validation for Project {pid}")
    from fastapi.testclient import TestClient
    from app.main import app
    from app.dependencies import get_authenticated_user
    
    res = db.table("users").select("id").limit(1).execute()
    uid = res.data[0]["id"]
    app.dependency_overrides[get_authenticated_user] = lambda: {"clerk_user_id": uid, "email": "audit@test.com", "session_id": "123"}
    
    client = TestClient(app)
    
    queries_to_test = [
        "What are the prerequisites?",
        "Show setup guide.",
        "Tell me about database schema.",
        "Tell me about Node.js."
    ]
    
    for q in queries_to_test:
        print(f"\n--- Query: {q} ---")
        try:
            resp = client.post(f"/api/v1/projects/{pid}/chat/stream", json={"question": q})
            lines = resp.text.strip().split("\n")
            
            full_ans = ""
            sources = []
            import json
            for line in lines:
                if line.startswith("data: "):
                    data_str = line[6:]
                    try:
                        data = json.loads(data_str)
                        if "text" in data:
                            full_ans += data["text"]
                        if "done" in data and "sources" in data:
                            sources = data["sources"]
                    except json.JSONDecodeError:
                        pass
                        
            print(f"Retrieved chunks/sources: {len(sources)}")
            if sources:
                scores = [s.get("similarity", 0) for s in sources if s.get("similarity") is not None]
                if scores:
                    print(f"Similarity scores: min={min(scores):.4f}, max={max(scores):.4f}")
            print("Assistant Answer:")
            print(full_ans)
        except Exception as e:
            print(f"Validation: FAIL (Error testing chat: {e})")
            
if __name__ == "__main__":
    run_phase3()
