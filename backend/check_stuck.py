import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(supabase_url, supabase_key)

print("--- STUCK PROJECTS ---")
projects = supabase.table("projects").select("id, title, status").eq("status", "running").execute()
for p in projects.data:
    print(f"Project: {p['title']} ({p['id']}) - Status: {p['status']}")
    runs = supabase.table("agent_runs").select("agent_name, status, error_message").eq("project_id", p["id"]).execute()
    for r in runs.data:
        print(f"  Agent: {r['agent_name']} - Status: {r['status']} - Error: {r.get('error_message')}")
    
    exports = supabase.table("export_events").select("*").eq("project_id", p["id"]).execute()
    print(f"  Exports: {len(exports.data)}")
    
    chunks = supabase.table("document_chunks").select("id", count="exact").eq("project_id", p["id"]).execute()
    print(f"  Chunks: {chunks.count}")
    
    versions = supabase.table("project_versions").select("id", count="exact").eq("project_id", p["id"]).execute()
    print(f"  Versions: {versions.count}")
    print()
