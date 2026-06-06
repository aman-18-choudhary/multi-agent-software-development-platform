import os
import asyncio
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

def main():
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Missing Supabase credentials")
        return
        
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    res = supabase.table("model_benchmarks").select("output").order("created_at", desc=True).limit(1).execute()
    if res.data:
        import json
        print(json.dumps(res.data[0]['output'], indent=2))
    else:
        print("No data found")

if __name__ == "__main__":
    main()
