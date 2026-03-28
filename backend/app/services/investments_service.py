from typing import Any
from datetime import datetime, timedelta

from app.services import yfinance_service as yf_svc
from app.services import portfolio_service as portfolio_svc


def get_investment_stats() -> dict[str, Any]:
    """Get investment page top stats."""
    holdings = portfolio_svc.get_holdings()
    portfolio = portfolio_svc._load_portfolio()
    cash = portfolio.get("cash_balance", 0)
    
    total_invested = sum(h["invested_value"] for h in holdings)
    total_current = sum(h["current_value"] for h in holdings)
    total_pnl = total_current - total_invested
    total_pnl_percent = (total_pnl / total_invested * 100) if total_invested else 0
    
    # Calculate day's change
    days_change = 0
    for h in holdings:
        try:
            quote = yf_svc.get_stock_quote(h["symbol"])
            prev_close = quote.get("previous_close") or h["current_price"]
            current = h["current_price"]
            days_change += (current - prev_close) * h["quantity"]
        except Exception:
            pass
    
    days_change_percent = (days_change / total_current * 100) if total_current else 0
    
    return {
        "total_investment_value": round(total_current, 2),
        "all_time_profit": round(total_pnl, 2),
        "all_time_profit_percent": round(total_pnl_percent, 2),
        "days_change": round(days_change, 2),
        "days_change_percent": round(days_change_percent, 2),
        "buying_power": round(cash, 2),
    }


def get_holdings_table() -> list[dict[str, Any]]:
    """Get holdings with trend data for investments table."""
    holdings = portfolio_svc.get_holdings()
    
    enriched = []
    for h in holdings:
        symbol = h["symbol"]
        
        # Get stock info for sector
        try:
            fundamentals = yf_svc.get_stock_fundamentals(symbol)
            sector = fundamentals.get("sector") or fundamentals.get("industry") or "N/A"
        except Exception:
            sector = "N/A"
        
        # Get trend data (last 7 days)
        try:
            history = yf_svc.get_stock_history(symbol, period="7d", interval="1d")
            trend = [{"date": p["date"], "close": p["close"]} for p in history]
        except Exception:
            trend = []
        
        # Extract ticker from symbol (remove .NS suffix)
        ticker = symbol.replace(".NS", "").replace(".BO", "")
        
        enriched.append({
            "symbol": symbol,
            "ticker": ticker,
            "name": ticker,  # Could fetch full name from fundamentals
            "sector": sector,
            "shares": h["quantity"],
            "cost_basis": h["avg_buy_price"],
            "current_price": h["current_price"],
            "market_value": h["current_value"],
            "return_percent": h["pnl_percent"],
            "return_value": h["pnl"],
            "trend": trend,
        })
    
    return enriched


def get_performance_history(period: str = "1M") -> dict[str, Any]:
    """Get portfolio performance history for chart.
    
    Generates historical portfolio value based on holdings' price history.
    """
    holdings = portfolio_svc.get_holdings()
    
    # Map period to yfinance params
    period_map = {
        "1M": ("1mo", "1d"),
        "3M": ("3mo", "1d"),
        "1Y": ("1y", "1wk"),
        "ALL": ("5y", "1mo"),
    }
    
    yf_period, yf_interval = period_map.get(period, ("1mo", "1d"))
    
    # Get price history for each holding
    all_histories = {}
    for h in holdings:
        try:
            history = yf_svc.get_stock_history(h["symbol"], period=yf_period, interval=yf_interval)
            for point in history:
                date = point["date"][:10]  # Get just the date part
                if date not in all_histories:
                    all_histories[date] = 0
                all_histories[date] += (point["close"] or 0) * h["quantity"]
        except Exception:
            pass
    
    # Sort by date and format
    sorted_dates = sorted(all_histories.keys())
    data_points = []
    peak_value = 0
    peak_date = ""
    
    for date in sorted_dates:
        value = round(all_histories[date], 2)
        data_points.append({
            "date": date,
            "value": value,
        })
        if value > peak_value:
            peak_value = value
            peak_date = date
    
    # Calculate growth
    if len(data_points) >= 2:
        start_value = data_points[0]["value"]
        end_value = data_points[-1]["value"]
        growth = end_value - start_value
        growth_percent = (growth / start_value * 100) if start_value else 0
    else:
        growth = 0
        growth_percent = 0
    
    return {
        "period": period,
        "data_points": data_points,
        "peak": {
            "value": peak_value,
            "date": peak_date,
        },
        "growth": round(growth, 2),
        "growth_percent": round(growth_percent, 2),
    }


def get_asset_breakdown() -> dict[str, Any]:
    """Get asset breakdown for pie chart."""
    holdings = portfolio_svc.get_holdings()
    portfolio = portfolio_svc._load_portfolio()
    cash = portfolio.get("cash_balance", 0)
    
    total_current = sum(h["current_value"] for h in holdings)
    total_assets = total_current + cash
    
    # Group by asset type
    breakdown = {}
    for h in holdings:
        asset_type = h.get("asset_type", "equity")
        if asset_type not in breakdown:
            breakdown[asset_type] = 0
        breakdown[asset_type] += h["current_value"]
    
    # Calculate percentages
    allocation = []
    for asset_type, value in breakdown.items():
        pct = (value / total_assets * 100) if total_assets else 0
        # Map asset types to display names
        display_name = {
            "equity": "Stocks",
            "mutual_fund": "Mutual Funds",
            "bond": "Bonds",
            "etf": "ETFs",
        }.get(asset_type, asset_type.title())
        
        allocation.append({
            "type": asset_type,
            "name": display_name,
            "value": round(value, 2),
            "percentage": round(pct, 2),
        })
    
    # Add cash
    if cash > 0:
        cash_pct = (cash / total_assets * 100) if total_assets else 0
        allocation.append({
            "type": "cash",
            "name": "Cash & Equivalents",
            "value": round(cash, 2),
            "percentage": round(cash_pct, 2),
        })
    
    # Sort by percentage descending
    allocation.sort(key=lambda x: x["percentage"], reverse=True)
    
    # Calculate target achievement (mock - assume 100% stocks is target)
    stocks_pct = sum(a["percentage"] for a in allocation if a["type"] == "equity")
    target_achievement = min(stocks_pct / 100 * 100, 100)  # Simplified
    
    return {
        "allocation": allocation,
        "total_value": round(total_assets, 2),
        "target_achievement": round(target_achievement, 2),
    }


def get_opportunities() -> list[dict[str, Any]]:
    """Get mock investment opportunities."""
    opportunities = [
        {
            "id": "opp_1",
            "action": "BUY",
            "symbol": "HDFCBANK.NS",
            "ticker": "HDFCBANK",
            "name": "HDFC Bank Ltd",
            "reason": "Strong fundamentals with consistent earnings growth. Recent correction provides entry opportunity.",
            "current_price": 1650.00,
            "daily_change": 1.2,
        },
        {
            "id": "opp_2",
            "action": "WATCH",
            "symbol": "WIPRO.NS",
            "ticker": "WIPRO",
            "name": "Wipro Ltd",
            "reason": "IT sector showing recovery signs. Wait for breakout above resistance.",
            "current_price": 450.00,
            "daily_change": -0.5,
        },
        {
            "id": "opp_3",
            "action": "BUY",
            "symbol": "TATAMOTORS.NS",
            "ticker": "TATAMOTORS",
            "name": "Tata Motors Ltd",
            "reason": "EV segment growth accelerating. Strong order book for JLR.",
            "current_price": 950.00,
            "daily_change": 2.1,
        },
    ]
    
    # Enrich with live prices
    for opp in opportunities:
        try:
            quote = yf_svc.get_stock_quote(opp["symbol"])
            opp["current_price"] = round(quote.get("price") or opp["current_price"], 2)
            prev_close = quote.get("previous_close") or opp["current_price"]
            opp["daily_change"] = round(
                ((opp["current_price"] - prev_close) / prev_close * 100) if prev_close else 0, 2
            )
        except Exception:
            pass
    
    return opportunities


def get_portfolio_alerts() -> list[dict[str, Any]]:
    """Get portfolio risk alerts."""
    holdings = portfolio_svc.get_holdings()
    
    alerts = []
    
    # Check sector concentration
    sector_values = {}
    total_value = sum(h["current_value"] for h in holdings)
    
    for h in holdings:
        try:
            fundamentals = yf_svc.get_stock_fundamentals(h["symbol"])
            sector = fundamentals.get("sector") or "Unknown"
        except Exception:
            sector = "Unknown"
        
        if sector not in sector_values:
            sector_values[sector] = 0
        sector_values[sector] += h["current_value"]
    
    # Check if any sector > 40%
    for sector, value in sector_values.items():
        pct = (value / total_value * 100) if total_value else 0
        if pct > 40:
            alerts.append({
                "type": "concentration",
                "severity": "warning",
                "title": "Portfolio Risk Alert",
                "message": f"Your {sector} exposure is currently {round(pct)}% above recommended allocation.",
                "action": "Rebalance Now",
            })
    
    # Check for high loss positions
    for h in holdings:
        if h["pnl_percent"] < -15:
            alerts.append({
                "type": "loss",
                "severity": "warning",
                "title": f"{h['symbol']} Down {abs(round(h['pnl_percent']))}%",
                "message": f"Consider reviewing your position in {h['symbol']}.",
                "action": "Review Position",
            })
    
    if not alerts:
        alerts.append({
            "type": "healthy",
            "severity": "info",
            "title": "Portfolio Health",
            "message": "Your portfolio is well diversified.",
            "action": None,
        })
    
    return alerts
