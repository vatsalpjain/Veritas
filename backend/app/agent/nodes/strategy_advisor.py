"""
Strategy advisor node — personalized investment strategy using portfolio context.
"""

import logging

from app.agent.config import PRIMARY_MODEL, safe_llm_call
from app.agent.prompts.strategy_prompt import STRATEGY_SYSTEM_PROMPT
from app.agent.prompts.system import get_veritas_system_prompt
from app.agent.state import AgentState
from app.agent.tools.market_overview import get_market_conditions, summarize_market_conditions
from app.agent.tools.portfolio_tools import build_portfolio_snapshots, get_portfolio_context, summarize_portfolio

log = logging.getLogger("veritas.nodes.strategy_advisor")


async def strategy_advisor_node(state: AgentState) -> dict:
    """
    Strategy pipeline:
    1. Fetch portfolio context
    2. Fetch market conditions
    3. ONE Llama 70B call for personalized advice
    """
    query = state["query"]

    # ── Step 1: Get portfolio ──
    portfolio = get_portfolio_context()
    portfolio_summary = summarize_portfolio(portfolio)

    # ── Step 2: Get market conditions ──
    market_conditions = get_market_conditions()
    market_brief = summarize_market_conditions(market_conditions)

    # ── Step 3: LLM strategy reasoning ──
    history_ctx = _build_history_context(state)
    system_prompt = f"{get_veritas_system_prompt()}\n\n{STRATEGY_SYSTEM_PROMPT}"

    user_message = (
        f"{history_ctx}"
        f"Query: {query}\n\n"
        f"Current Portfolio:\n{portfolio_summary}\n\n"
        f"Market Conditions:\n{market_brief}\n\n"
        "Provide actionable strategy advice. Be specific about what to buy/sell/hold and why."
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

    data_snapshots = build_portfolio_snapshots(portfolio)
    sources: list[dict] = [
        {
            "type": "portfolio",
            "title": "Your Portfolio",
            "url": None,
            "snippet": portfolio_summary[:120],
            "confidence": None,
        },
    ]

    return {
        "tool_results": [
            {"tool": "portfolio", "data": portfolio_summary},
            {"tool": "market_overview", "data": market_brief},
        ],
        "tool_summaries": [
            "Loaded portfolio context",
            "Checked market conditions",
        ],
        "sources": sources,
        "data_snapshots": data_snapshots,
        "thinking_steps": [
            {"step": "Loading your portfolio...", "tool": "portfolio", "status": "done"},
            {"step": "Analyzing market conditions...", "tool": "market_overview", "status": "done"},
            {"step": "Formulating strategy...", "tool": None, "status": "done"},
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
