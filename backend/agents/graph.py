"""
MASDP LangGraph Pipeline — Graph Definition.

Wires the agents together in a sequential pipeline.
"""

from langgraph.graph import StateGraph, END
from agents.state import GraphState
from agents.nodes import (
    run_planner,
    run_pm,
    run_architect,
    run_database,
    run_documentation,
)

# Initialize the StateGraph
workflow = StateGraph(GraphState)

# Add all agent nodes
workflow.add_node("planner", run_planner)
workflow.add_node("pm", run_pm)
workflow.add_node("architect", run_architect)
workflow.add_node("database", run_database)
workflow.add_node("documentation", run_documentation)

# Set the entry point
workflow.set_entry_point("planner")

# Add sequential edges
workflow.add_edge("planner", "pm")
workflow.add_edge("pm", "architect")
workflow.add_edge("architect", "database")
workflow.add_edge("database", "documentation")
workflow.add_edge("documentation", END)

# Compile into an executable graph
graph = workflow.compile()
