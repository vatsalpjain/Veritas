"""
Strategy advisor node — personalized investment strategy using portfolio context.
"""

import logging
from datetime import datetime, timezone

from app.agent.config import PRIMARY_MODEL, safe_llm_call
from app.agent.prompts.strategy_prompt import STRATEGY_SYSTEM_PROMPT
from app.agent.prompts.system import get_veritas_system_prompt
from app.agent.state import AgentState
from app.agent.tools.evidence_tools import build_evidence_items
from app.agent.tools.market_overview import get_market_conditions, summarize_market_conditions
from app.agent.tools.portfolio_tools import build_portfolio_snapshots, get_portfolio_context, summarize_portfolio
from app.agent.tools.web_search import summarize_search_results, web_search
from app.agent.tools.workflow_plan import get_mode_plan

log = logging.getLogger("veritas.nodes.strategy_advisor")


async def strategy_advisor_node(state: AgentState) -> dict:
    """
    Strategy pipeline:
    1. Fetch portfolio context
    2. Fetch market conditions
    3. ONE Llama 70B call for personalized advice
    """
    query = state["query"]
    iteration = int(state.get("iteration", 0)) + 1

    # ── Step 1: Get portfolio ──
    portfolio = get_portfolio_context()
    portfolio_summary = summarize_portfolio(portfolio)

    # ── Step 2: Get market conditions ──
    market_conditions = get_market_conditions()
    market_brief = summarize_market_conditions(market_conditions)
    macro_results: list[dict] = []
    macro_summary = ""
    if iteration > 1:
        macro_results = web_search("latest macro policy rates inflation market outlook", max_results=3)
        macro_summary = summarize_search_results(macro_results, max_items=3)

    # ── Step 3: LLM strategy reasoning ──
    history_ctx = _build_history_context(state)
    system_prompt = f"{get_veritas_system_prompt()}\n\n{STRATEGY_SYSTEM_PROMPT}"

    user_message = (
        f"{history_ctx}"
        f"Query: {query}\n\n"
        f"Current Portfolio:\n{portfolio_summary}\n\n"
        f"Market Conditions:\n{market_brief}\n\n"
        f"Macro Signals:\n{macro_summary or 'No additional macro scan in this pass.'}\n\n"
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

    portfolio_items = [{"title": "Your Portfolio", "published": datetime.now(timezone.utc).isoformat()}]
    signal_items = [
        {
            "title": f"Signal {s.get('ticker', '?')}",
            "url": None,
            "published": datetime.now(timezone.utc).isoformat(),
            "sentiment": "positive" if s.get("status") == "CONFIRMED" else "neutral",
        }
        for s in (market_conditions.get("signals") or [])[:4]
    ]
    evidence_items = (
        build_evidence_items(iteration=iteration, intent="strategy", source_type="portfolio", raw_items=portfolio_items)
        + build_evidence_items(iteration=iteration, intent="strategy", source_type="web_search", raw_items=signal_items)
        + build_evidence_items(iteration=iteration, intent="strategy", source_type="web_search", raw_items=macro_results)
    )
    mode_plan = get_mode_plan("strategy", iteration, [])
    if evidence_items:
        sources[0]["confidence"] = evidence_items[0]["confidence"]

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
        "traces": [
            {
                "iteration": int(state.get("iteration", 0)) + 1,
                "layer": "execution",
                "intent": "strategy",
                "summary": "Combined portfolio state with current market conditions to draft strategy.",
                "confidence": float(state.get("intent_confidence", 0.0)) if state.get("intent_confidence") is not None else None,
                "stop_reason": None,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        ],
        "iteration_outputs": [
            {
                "iteration": int(state.get("iteration", 0)) + 1,
                "layer": "execution",
                "intent": "strategy",
                "tools": ["portfolio", "market_overview"],
                "tool_summaries": [
                    "Loaded allocation/diversification context",
                    "Reviewed index/sector/signal environment",
                    *([f"Checked {len(macro_results)} macro/policy references"] if macro_results else []),
                ],
                "mode_plan": mode_plan,
                "answer_preview": answer[:220],
            }
        ],
        "evidence_items": evidence_items,
        "thinking_steps": [
            {"step": "Loading your portfolio...", "tool": "portfolio", "status": "done"},
            {"step": "Analyzing market conditions...", "tool": "market_overview", "status": "done"},
            *([{"step": "Running macro-policy refinement pass...", "tool": "web_search", "status": "done"}] if iteration > 1 else []),
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
