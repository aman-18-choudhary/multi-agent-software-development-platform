import asyncio
import os
from dotenv import load_dotenv

# Load env before importing agents
load_dotenv()

import app.services.agent_service

# Mock the database saving to avoid requiring valid Supabase user_id
async def mock_save(*args, **kwargs):
    print(f"[MOCK DB] save_agent_run: {args} {kwargs}")
app.services.agent_service.save_agent_run = mock_save

from agents.nodes import run_planner
from agents.state import GraphState

async def main():
    state = GraphState(
        project_id="test-id-123",
        user_idea="A scalable e-commerce app",
        project_title="Test E-commerce",
        planner_output=None,
        pm_output=None,
        architect_output=None,
        database_output=None,
        documentation_output=None,
        current_agent="planner",
        status="running",
        error=None,
    )
    
    print("Testing run_planner...")
    try:
        result = await run_planner(state)
        print("Success! Planner output generated.")
    except Exception as e:
        print(f"FAILED: {type(e).__name__} - {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())
