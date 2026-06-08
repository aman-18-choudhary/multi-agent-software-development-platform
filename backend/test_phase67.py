import os
import asyncio
import time
from dotenv import load_dotenv

load_dotenv()

async def run_phase67():
    from supabase import create_client
    db = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_SERVICE_ROLE_KEY'])
    
    with open("test_pid.txt", "r") as f:
        pid = f.read().strip()
        
    print(f"Using Project ID: {pid}")
    
    res = db.table("users").select("id").limit(1).execute()
    uid = res.data[0]["id"]
    current_user = {"clerk_user_id": uid, "email": "audit@test.com", "session_id": "123"}
    
    # ------------------------------------------
    # Phase 6: Iteration
    # ------------------------------------------
    print("\nPHASE 6: Iteration Validation")
    from app.api.v1.projects import create_project_version, ImprovementRequest, evolve_project, EvolveRequest
    
    # Check baseline versions
    v_base = db.table("project_versions").select("version_number").eq("project_id", pid).execute()
    print(f"Base versions count: {len(v_base.data)}")
    
    # Trigger Iteration
    req = ImprovementRequest(goal="Add Redis caching layer.")
    resp = await create_project_version(pid, req, current_user, db)
    print(f"Iteration triggered. New Version: {resp.get('version')}, Status: {resp.get('status')}")
    
    print("Waiting for Iteration pipeline to complete...")
    for _ in range(60): # wait up to 5 mins
        await asyncio.sleep(5)
        r = db.table("projects").select("status").eq("id", pid).execute()
        status = r.data[0]["status"]
        if status in ["complete", "failed"]:
            print(f"Iteration pipeline finished with status: {status}")
            break
        print(f"Status: {status}...")
        
    # Verify Version 2 created
    v_iter = db.table("project_versions").select("version_number,summary").eq("project_id", pid).execute()
    print(f"Versions found after iteration: {len(v_iter.data)}")
    if any(v["version_number"] == 2 for v in v_iter.data):
        print("Validation: PASS (Version 2 created)")
    else:
        print("Validation: FAIL (Version 2 missing)")
        
    # Verify Compare Versions
    print("\nTesting Compare Versions (v1 vs v2)")
    from app.services.version_service import compare_versions
    try:
        diff_output = compare_versions(db, pid, 1, 2)
        print("Validation: PASS (Compare Versions works)")
        print(f"Diff keys: {list(diff_output.keys())}")
    except Exception as e:
        print(f"Validation: FAIL (Compare Versions Error: {e})")
        
    # ------------------------------------------
    # Phase 7: Evolution
    # ------------------------------------------
    print("\nPHASE 7: Evolution Validation")
    req_ev = EvolveRequest(change_request="Convert monolith to microservices architecture.")
    resp_ev = await evolve_project(pid, req_ev, current_user, db)
    print(f"Evolution triggered. New Version: {resp_ev.get('version')}, Status: {resp_ev.get('status')}")
    
    print("Waiting for Evolution pipeline to complete...")
    for _ in range(60): # wait up to 5 mins
        await asyncio.sleep(5)
        r = db.table("projects").select("status").eq("id", pid).execute()
        status = r.data[0]["status"]
        if status in ["complete", "failed"]:
            print(f"Evolution pipeline finished with status: {status}")
            break
        print(f"Status: {status}...")
        
    # Verify Version 3 created
    v_evol = db.table("project_versions").select("version_number,summary").eq("project_id", pid).execute()
    print(f"Versions found after evolution: {len(v_evol.data)}")
    if any(v["version_number"] == 3 for v in v_evol.data):
        print("Validation: PASS (Version 3 created)")
    else:
        print("Validation: FAIL (Version 3 missing)")

if __name__ == "__main__":
    asyncio.run(run_phase67())
