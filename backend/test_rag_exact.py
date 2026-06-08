import os
import sys
from dotenv import load_dotenv
import asyncio
import json

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

pid = "c25672bd-f0ec-4e8a-8efc-3edb44c2b79e"
print("Testing RAG for project", pid)
resp = client.post(f"/api/v1/projects/{pid}/chat/stream", json={"question": "What are the prerequisites?"})
print("RAG Status:", resp.status_code)
if resp.status_code == 200:
    for line in resp.text.splitlines():
        if line.startswith("data: "):
            try:
                data = json.loads(line[6:])
                if "text" in data:
                    print(data["text"], end="")
            except:
                pass
else:
    print(resp.text)
