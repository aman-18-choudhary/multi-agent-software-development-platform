import os
import sys
from dotenv import load_dotenv

load_dotenv()

from fastapi.testclient import TestClient
from app.main import app
from app.dependencies import get_authenticated_user
from supabase import create_client

db = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_SERVICE_ROLE_KEY'])
res = db.table("users").select("id").limit(1).execute()
uid = res.data[0]["id"]
app.dependency_overrides[get_authenticated_user] = lambda: {"clerk_user_id": uid, "email": "audit@test.com", "session_id": "123"}
client = TestClient(app)

pid = "c25672bd-f0ec-4e8a-8efc-3edb44c2b79e"
response = client.get(f"/api/v1/projects/{pid}/export/pdf")
print("PDF Export Status:", response.status_code)
if response.status_code != 200:
    print("Error:", response.text)
