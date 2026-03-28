"""
What-if / cause chain analysis node — scenario simulation with historical precedents.
"""

import logging

from app.agent.config import PRIMARY_MODEL, safe_llm_call
from app.agent.prompts.system import get_veritas_system_prompt
from app.agent.prompts.what_if_prompt import WHAT_IF_SYSTEM_PROMPT
from app.agent.state import AgentState
from app.agent.tools.market_data import build_data_snapshots, get_asset_data, summarize_market_data
from app.agent.tools.web_search import summarize_search_results, web_search

log = logging.getLogger("veritas.nodes.what_if")


async def what_if_node(state: AgentState) -> dict:
    """
    What-if pipeline:
    1. Web search for historical precedents of the scenario
    2. Fetch current market data for affected entities
    3. ONE Llama 70B call for causal chain reasoning
    """
    query = state["query"]
    entities = state.get("entities") or []

    # ── Step 1: Search historical precedents ──
    search_query = f"historical impact {query} stock market financial markets"
    precedents = web_search(search_query, max_results=5)
    precedent_summary = summarize_search_results(precedents)

    # ── Step 2: Get current data for affected entities ──
    market_data: dict = {}
    market_summary = "No specific assets identified."
    data_snapshots: list[dict] = []
    if entities:
        market_data = get_asset_data(entities)
        market_summary = summarize_market_data(market_data)
        data_snapshots = build_data_snapshots(market_data)

    # ── Step 3: LLM causal chain reasoning ──
    history_ctx = _build_history_context(state)
    system_prompt = f"{get_veritas_system_prompt()}\n\n{WHAT_IF_SYSTEM_PROMPT}"

    user_message = (
        f"{history_ctx}"
        f"Scenario: {query}\n\n"
        f"Historical Precedents:\n{precedent_summary}\n\n"
        f"Current Market Context:\n{market_summary}\n\n"
        "Build a cause-and-effect chain:\n"
        "1. Immediate impacts (0-1 week)\n"
        "2. Secondary effects (1-4 weeks)\n"
        "3. Long-term implications (1-6 months)\n"
        "4. Which sectors/assets are most affected?\n"
        "5. Historical parallel and what happened then."
    )

    answer = await safe_llm_call(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        model=PRIMARY_MODEL,
        max_tokens=600,
        fallback_model="llama-3.1-8b-instant",
    )

    sources: list[dict] = []
    for r in precedents[:5]:
        sources.append({
            "type": "web_search",
            "title": r.get("title", "Web result"),
            "url": r.get("url"),
            "snippet": (r.get("snippet") or "")[:150],
            "confidence": None,
        })

    return {
        "tool_results": [
            {"tool": "web_search", "data": precedent_summary},
            {"tool": "market_data", "data": market_summary},
        ],
        "tool_summaries": [
            f"Found {len(precedents)} historical precedents",
            f"Checked {len(entities)} affected assets",
        ],
        "sources": sources,
        "data_snapshots": data_snapshots,
        "thinking_steps": [
            {"step": "Searching historical precedents...", "tool": "web_search", "status": "done"},
            {"step": "Checking affected assets...", "tool": "market_data", "status": "done"},
            {"step": "Building cause-effect chain...", "tool": None, "status": "done"},
        ],
        "answer": answer,
    }


def _build_history_context(state: AgentState) -> str:
    history = state.get("conversation_history") or []
    if not history:
        return ""
    last = history[-4:]
    lines = [f"{'User' if t['role'] == 'user' else 'Veritas'}: {t['content'][:200]}" for t in last]
    return "Conversation context:\n" + "\n".join(lines) + "\n\n"
