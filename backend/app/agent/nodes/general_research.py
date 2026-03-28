"""
General research node — catch-all for general financial questions.
"""

import logging

from app.agent.config import PRIMARY_MODEL, safe_llm_call
from app.agent.prompts.system import get_veritas_system_prompt
from app.agent.state import AgentState
from app.agent.tools.market_data import build_data_snapshots, get_asset_data, summarize_market_data
from app.agent.tools.web_search import summarize_search_results, web_search

log = logging.getLogger("veritas.nodes.general_research")


async def general_research_node(state: AgentState) -> dict:
    """
    General pipeline:
    1. Web search for context
    2. Optionally fetch market data if entities look like tickers
    3. ONE Llama 70B call to answer
    """
    query = state["query"]
    entities = state.get("entities") or []

    # ── Step 1: Web search ──
    search_results = web_search(query, max_results=3)
    search_summary = summarize_search_results(search_results)

    # ── Step 2: Market data if entities present ──
    market_summary = ""
    data_snapshots: list[dict] = []
    if entities:
        market_data = get_asset_data(entities)
        market_summary = summarize_market_data(market_data)
        data_snapshots = build_data_snapshots(market_data)

    # ── Step 3: LLM answer ──
    history_ctx = _build_history_context(state)
    system_prompt = get_veritas_system_prompt()

    parts = [f"{history_ctx}Query: {query}"]
    if search_summary and search_summary != "No web results found.":
        parts.append(f"\nWeb Search Results:\n{search_summary}")
    if market_summary and market_summary != "No market data available.":
        parts.append(f"\nMarket Data:\n{market_summary}")

    user_message = "\n".join(parts)

    answer = await safe_llm_call(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        model=PRIMARY_MODEL,
        max_tokens=500,
        fallback_model="llama-3.1-8b-instant",
    )

    sources: list[dict] = []
    for r in search_results[:3]:
        sources.append({
            "type": "web_search",
            "title": r.get("title", "Web result"),
            "url": r.get("url"),
            "snippet": (r.get("snippet") or "")[:150],
            "confidence": None,
        })

    return {
        "tool_results": [{"tool": "web_search", "data": search_summary}],
        "tool_summaries": ["Searched web for context"],
        "sources": sources,
        "data_snapshots": data_snapshots,
        "thinking_steps": [
            {"step": "Researching...", "tool": "web_search", "status": "done"},
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
