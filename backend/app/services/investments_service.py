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
    """Get portfolio performance history from transaction data.
    
    Calculates actual portfolio value over time based on transaction history.
    """
    portfolio = portfolio_svc._load_portfolio()
    transactions = portfolio.get("transactions", [])
    holdings = portfolio.get("holdings", [])
    cash_balance = portfolio.get("cash_balance", 0)
    
    if not transactions:
        return {
            "period": period,
            "data_points": [],
            "peak": {"value": 0, "date": ""},
            "growth": 0,
            "growth_percent": 0,
        }
    
    # Sort transactions by date
    sorted_txns = sorted(
        transactions,
        key=lambda x: datetime.fromisoformat(x.get("timestamp", x.get("date", "2024-01-01")))
    )
    
    # Determine date range based on period
    now = datetime.now()
    if period == "1M":
        start_date = now - timedelta(days=30)
    elif period == "3M":
        start_date = now - timedelta(days=90)
    elif period == "1Y":
        start_date = now - timedelta(days=365)
    else:  # ALL
        start_date = datetime.fromisoformat(sorted_txns[0].get("timestamp", sorted_txns[0].get("date", "2024-01-01")))
    
    # Calculate portfolio value at each transaction point
    data_points = []
    running_cash = 0
    holdings_qty = {}  # Track quantity of each holding
    holdings_avg_price = {}  # Track average buy price
    
    for txn in sorted_txns:
        txn_date = datetime.fromisoformat(txn.get("timestamp", txn.get("date", "2024-01-01")))
        
        # Process transaction to update running totals
        if txn["type"] == "buy":
            symbol = txn["symbol"]
            qty = txn.get("quantity", 0)
            price = txn.get("price", 0)
            total = txn.get("total_amount", qty * price)
            
            holdings_qty[symbol] = holdings_qty.get(symbol, 0) + qty
            # Update average price
            old_qty = holdings_qty[symbol] - qty
            old_avg = holdings_avg_price.get(symbol, 0)
            holdings_avg_price[symbol] = ((old_qty * old_avg) + total) / holdings_qty[symbol] if holdings_qty[symbol] > 0 else price
            
            running_cash -= total
        elif txn["type"] == "sell":
            symbol = txn["symbol"]
            qty = txn.get("quantity", 0)
            total = txn.get("total_amount", 0)
            
            holdings_qty[symbol] = holdings_qty.get(symbol, 0) - qty
            running_cash += total
        elif txn["type"] == "dividend":
            running_cash += txn.get("amount", 0)
        
        # Only add data points after start_date
        if txn_date >= start_date:
            # Calculate total portfolio value (cash + holdings at average buy price)
            holdings_value = sum(
                holdings_qty.get(symbol, 0) * holdings_avg_price.get(symbol, 0)
                for symbol in holdings_qty.keys()
                if holdings_qty.get(symbol, 0) > 0
            )
            
            total_value = running_cash + holdings_value
            
            data_points.append({
                "date": txn_date.strftime("%Y-%m-%d"),
                "value": round(total_value, 2)
            })
    
    # Add current value as final data point
    current_holdings_value = sum(h["quantity"] * h["avg_buy_price"] for h in holdings)
    current_total = cash_balance + current_holdings_value
    
    if not data_points or data_points[-1]["date"] != now.strftime("%Y-%m-%d"):
        data_points.append({
            "date": now.strftime("%Y-%m-%d"),
            "value": round(current_total, 2)
        })
    
    # Calculate metadata
    if data_points:
        peak_value = max(dp["value"] for dp in data_points)
        peak_date = next(dp["date"] for dp in data_points if dp["value"] == peak_value)
        start_value = data_points[0]["value"]
        end_value = data_points[-1]["value"]
        growth = end_value - start_value
        growth_percent = (growth / start_value * 100) if start_value > 0 else 0
    else:
        peak_value = 0
        peak_date = ""
        growth = 0
        growth_percent = 0
    
    return {
        "period": period,
        "data_points": data_points,
        "peak": {
            "value": round(peak_value, 2),
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
