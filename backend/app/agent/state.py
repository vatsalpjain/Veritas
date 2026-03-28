"""
Agent state schema — the single TypedDict that flows through the LangGraph.
"""

from typing import Any, Literal, TypedDict


class SourceReference(TypedDict):
    """A source the agent referenced during research."""
    type: Literal["news", "market_data", "web_search", "portfolio", "filing"]
    title: str
    url: str | None
    snippet: str
    confidence: float | None


class DataSnapshot(TypedDict):
    """A data card to display on the context panel."""
    type: Literal["stock_quote", "metric", "chart_data", "sentiment", "portfolio_summary"]
    label: str
    data: dict[str, Any]


class ThinkingStep(TypedDict):
    """An intermediate thinking step streamed to the frontend."""
    step: str
    tool: str | None
    status: Literal["running", "done", "error"]


class AgentState(TypedDict):
    # ── Input ──
    query: str
    session_id: str
    conversation_history: list[dict[str, str]]

    # ── Router output ──
    intent: Literal["verify", "analyze", "strategy", "what_if", "general"]
    intent_confidence: float
    entities: list[str]
    needs_portfolio: bool

    # ── Scratchpad (accumulated by subgraph nodes) ──
    tool_results: list[dict[str, Any]]
    tool_summaries: list[str]
    sources: list[SourceReference]
    data_snapshots: list[DataSnapshot]
    thinking_steps: list[ThinkingStep]

    # ── Output ──
    answer: str
    verification_result: dict[str, Any] | None
    error: str | None
