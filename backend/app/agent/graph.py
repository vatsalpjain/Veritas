"""
LangGraph StateGraph definition for the Veritas research agent.
"""

from langgraph.graph import END, START, StateGraph

from app.agent.nodes.analyze_asset import analyze_asset_node
from app.agent.nodes.general_research import general_research_node
from app.agent.nodes.router import router_node
from app.agent.nodes.strategy_advisor import strategy_advisor_node
from app.agent.nodes.verify_news import verify_news_node
from app.agent.nodes.what_if import what_if_node
from app.agent.state import AgentState


def _route_by_intent(state: AgentState) -> str:
    """Conditional edge function — returns the next node name based on classified intent."""
    return state["intent"]


def create_agent_graph():
    """Build and compile the Veritas agent graph."""

    graph = StateGraph(AgentState)

    # Register nodes
    graph.add_node("router", router_node)
    graph.add_node("verify", verify_news_node)
    graph.add_node("analyze", analyze_asset_node)
    graph.add_node("strategy", strategy_advisor_node)
    graph.add_node("what_if", what_if_node)
    graph.add_node("general", general_research_node)

    # Entry edge
    graph.add_edge(START, "router")

    # Conditional routing from router
    graph.add_conditional_edges(
        "router",
        _route_by_intent,
        {
            "verify": "verify",
            "analyze": "analyze",
            "strategy": "strategy",
            "what_if": "what_if",
            "general": "general",
        },
    )

    # All subgraphs go directly to END
    graph.add_edge("verify", END)
    graph.add_edge("analyze", END)
    graph.add_edge("strategy", END)
    graph.add_edge("what_if", END)
    graph.add_edge("general", END)

    return graph.compile()
