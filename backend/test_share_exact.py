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
print("Generating share token...")
resp1 = client.post(f"/api/v1/projects/{pid}/share")
if resp1.status_code == 200:
    token = resp1.json().get("token")
    print("Token:", token)
    app.dependency_overrides = {} # remove auth for public route
    pub_client = TestClient(app)
    resp2 = pub_client.get(f"/api/v1/share/{token}")
    print("GET Share Status:", resp2.status_code)
    if resp2.status_code != 200:
        print("Error:", resp2.text)
    else:
        print("Success! Data keys:", resp2.json().keys())
else:
    print("Failed to generate token:", resp1.text)
