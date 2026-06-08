import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not supabase_key:
    print("Missing Supabase credentials")
    exit(1)

supabase = create_client(supabase_url, supabase_key)

print("Starting database fix...")

# 1. Transfer projects from test-clerk-123 to real Clerk account (5e38d...)
res1 = supabase.table("projects").update({"user_id": "5e38d410-97ec-4f34-ba77-64397709167f"}).eq("user_id", "65470f34-e294-44b0-bdca-af5881af663e").execute()
print(f"Updated {len(res1.data)} projects from test-clerk-123.")

# 2. Transfer projects from ghost user (ce94...) to real Clerk account
res2 = supabase.table("projects").update({"user_id": "5e38d410-97ec-4f34-ba77-64397709167f"}).eq("user_id", "ce94c37a-5f77-4a8a-9c7a-e5fbfca59fb2").execute()
print(f"Updated {len(res2.data)} projects from ghost user.")

# 3. Delete ghost user
res3 = supabase.table("users").delete().eq("id", "ce94c37a-5f77-4a8a-9c7a-e5fbfca59fb2").execute()
print("Deleted ghost user.")

# 4. Delete test user
res4 = supabase.table("users").delete().eq("id", "65470f34-e294-44b0-bdca-af5881af663e").execute()
print("Deleted test user.")

print("Database fix completed successfully.")
