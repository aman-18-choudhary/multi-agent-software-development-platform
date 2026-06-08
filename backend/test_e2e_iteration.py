import os
import sys
import asyncio
from dotenv import load_dotenv

load_dotenv("backend/.env")

from app.services.agent_service import trigger_iteration_pipeline, trigger_evolution_pipeline

async def main():
    pid = "c25672bd-f0ec-4e8a-8efc-3edb44c2b79e"
    print("Running Iteration...")
    await trigger_iteration_pipeline(pid, "Add Redis caching layer")
    print("Iteration finished successfully.")
    
    print("Running Evolution...")
    await trigger_evolution_pipeline(pid, "Convert architecture from monolith to microservices")
    print("Evolution finished successfully.")

if __name__ == "__main__":
    asyncio.run(main())
