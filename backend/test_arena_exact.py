import os
import sys
from dotenv import load_dotenv

load_dotenv()

from fastapi.testclient import TestClient
from app.main import app
from app.auth.clerk import get_current_user
from supabase import create_client

db = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_SERVICE_ROLE_KEY'])
res = db.table("users").select("id").limit(1).execute()
uid = res.data[0]["id"]
app.dependency_overrides[get_current_user] = lambda: {"clerk_user_id": uid, "email": "audit@test.com", "session_id": "123"}
client = TestClient(app)

print("Testing Arena...")
resp = client.post("/api/v1/arena/run", json={"prompt": "A simple todo app", "models": ["llama-3.1-8b-instant", "gemma2-9b-it"]})
print("Arena Status:", resp.status_code)
if resp.status_code != 200:
    print("Error:", resp.text)
else:
    print("Success! Got results array length:", len(resp.json()))
