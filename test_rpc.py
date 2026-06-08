import os
import requests
from dotenv import load_dotenv

load_dotenv("backend/.env")
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

with open("database/migrations/20260608_rag_metrics.sql", "r") as f:
    sql = f.read()

resp = requests.post(
    f"{url}/rest/v1/rpc/exec_sql",
    headers={"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json"},
    json={"sql": sql}
)
print("Exec SQL status:", resp.status_code)
print(resp.text)
