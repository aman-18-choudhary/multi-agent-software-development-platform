import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(supabase_url, supabase_key)

print("--- USERS ---")
users = supabase.table("users").select("*").execute()
for u in users.data:
    print(u)

print("\n--- PROJECTS ---")
projects = supabase.table("projects").select("id, user_id, title").execute()
for p in projects.data:
    print(p)
