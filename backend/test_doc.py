import asyncio
import logging
from agents.nodes import run_documentation

logging.basicConfig(level=logging.INFO)

async def test():
    state = {
        "project_id": "test",
        "user_idea": "test",
        "planner_output": None,
        "pm_output": None,
        "architect_output": None,
        "database_output": None
    }
    await run_documentation(state)

asyncio.run(test())
