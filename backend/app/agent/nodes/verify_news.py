"""
Verify news node — cross-references news from multiple sources to check truthfulness.
Also fetches current market data when stock entities are detected.
"""

import logging

from app.agent.config import PRIMARY_MODEL, safe_llm_call
from app.agent.prompts.system import get_veritas_system_prompt
from app.agent.prompts.verify_prompt import VERIFY_SYSTEM_PROMPT
from app.agent.state import AgentState
from app.agent.tools.market_data import build_data_snapshots, get_asset_data, summarize_market_data
from app.agent.tools.news_tools import build_source_refs, get_news_for_entities, summarize_news_results
from app.agent.tools.web_search import summarize_search_results, web_search

log = logging.getLogger("veritas.nodes.verify_news")


async def verify_news_node(state: AgentState) -> dict:
    """
    Verification pipeline:
    1. Web search for independent sources (Tavily primary)
    2. Fetch news from Finnhub for the entities
    3. Fetch current market data if stock entities detected
    4. ONE Llama 70B call with all context
    """
    entities = state.get("entities") or []
    query = state["query"]

    # ── Step 1: Web search (primary verification source) ──
    web_results = web_search(query, max_results=5)
    web_summary = summarize_search_results(web_results)

    # ── Step 2: Fetch news ──
    news_results = get_news_for_entities(entities, limit=3) if entities else []
    news_summary = summarize_news_results(news_results, max_items=3)

    # ── Step 3: Fetch market data for any stock entities ──
    market_data: dict = {}
    market_summary = ""
    data_snapshots: list[dict] = []
    if entities:
        market_data = get_asset_data(entities)
        market_summary = summarize_market_data(market_data)
        data_snapshots = build_data_snapshots(market_data)

    # ── Step 4: LLM verification ──
    history_ctx = _build_history_context(state)
    system_prompt = f"{get_veritas_system_prompt()}\n\n{VERIFY_SYSTEM_PROMPT}"

    parts = [f"{history_ctx}Claim to verify: {query}"]
    parts.append(f"\nWeb search results:\n{web_summary}")
    if news_summary and news_summary != "No relevant news articles found.":
        parts.append(f"\nFinancial news:\n{news_summary}")
    if market_summary and market_summary != "No market data available.":
        parts.append(f"\nCurrent market data:\n{market_summary}")

    answer = await safe_llm_call(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "\n".join(parts)},
        ],
        model=PRIMARY_MODEL,
        max_tokens=600,
        fallback_model="llama-3.1-8b-instant",
    )

    sources = build_source_refs(news_results, web_results)

    return {
        "tool_results": [
            {"tool": "web_search", "data": web_summary},
            {"tool": "news_fetch", "data": news_summary},
        ],
        "tool_summaries": [
            f"Found {len(web_results)} web results",
            f"Found {len(news_results)} news articles",
        ],
        "sources": sources,
        "data_snapshots": data_snapshots,
        "thinking_steps": [
            {"step": "Searching web sources...", "tool": "web_search", "status": "done"},
            {"step": f"Checking news for {', '.join(entities) or 'topic'}...", "tool": "news_fetch", "status": "done"},
            *([{"step": f"Fetching prices for {', '.join(entities)}...", "tool": "market_data", "status": "done"}] if entities else []),
            {"step": "Verifying claim...", "tool": None, "status": "done"},
        ],
        "verification_result": {"raw_analysis": answer},
        "answer": answer,
    }


def _build_history_context(state: AgentState) -> str:
    history = state.get("conversation_history") or []
    if not history:
        return ""
    last = history[-4:]
    lines = [f"{'User' if t['role'] == 'user' else 'Veritas'}: {t['content'][:200]}" for t in last]
    return "Conversation context:\n" + "\n".join(lines) + "\n\n"
