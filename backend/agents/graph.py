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
    run_critic,
    run_improver,
)

def should_improve(state: GraphState):
    if state.get("improvement_goal"):
        return "improver"
    return END

# Initialize the StateGraph
workflow = StateGraph(GraphState)

# Add all agent nodes
workflow.add_node("planner", run_planner)
workflow.add_node("pm", run_pm)
workflow.add_node("architect", run_architect)
workflow.add_node("database", run_database)
workflow.add_node("documentation", run_documentation)
workflow.add_node("critic", run_critic)
workflow.add_node("improver", run_improver)

# Set the entry point
def route_start(state: GraphState):
    if state.get("improvement_goal"):
        return "improver"
    return "planner"

workflow.set_conditional_entry_point(
    route_start,
    {
        "improver": "improver",
        "planner": "planner"
    }
)

# Add sequential edges
workflow.add_edge("planner", "pm")
workflow.add_edge("pm", "architect")
workflow.add_edge("architect", "database")
workflow.add_edge("database", "documentation")
workflow.add_edge("documentation", "critic")
workflow.add_conditional_edges("critic", should_improve)
workflow.add_edge("improver", END)

# Compile into an executable graph
graph = workflow.compile()
