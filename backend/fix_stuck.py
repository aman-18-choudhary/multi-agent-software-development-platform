import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(supabase_url, supabase_key)

print("Fixing stuck projects...")
projects = supabase.table("projects").select("id, title, status").eq("status", "running").execute()

for p in projects.data:
    runs = supabase.table("agent_runs").select("agent_name, status").eq("project_id", p["id"]).execute()
    
    all_complete = True
    any_failed = False
    
    for r in runs.data:
        if r["status"] == "failed":
            any_failed = True
        if r["status"] != "complete":
            all_complete = False
            
    if all_complete and len(runs.data) >= 5:
        print(f"Setting {p['title']} to complete")
        supabase.table("projects").update({"status": "complete"}).eq("id", p["id"]).execute()
    else:
        print(f"Setting {p['title']} to failed (interrupted)")
        supabase.table("projects").update({"status": "failed"}).eq("id", p["id"]).execute()

print("Done.")
