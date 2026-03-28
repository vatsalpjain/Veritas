import json
from pathlib import Path
from typing import Any
from datetime import datetime

from app.services import yfinance_service as yf_svc

DATA_FILE = Path(__file__).parent.parent.parent / "data" / "portfolio.json"


def _load_portfolio() -> dict:
    """Load portfolio from JSON file."""
    if not DATA_FILE.exists():
        return {"holdings": [], "cash_balance": 0, "transactions": []}
    with open(DATA_FILE, "r") as f:
        return json.load(f)


def _save_portfolio(data: dict) -> None:
    """Save portfolio to JSON file."""
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)


def get_holdings() -> list[dict[str, Any]]:
    """Get all holdings with current prices."""
    portfolio = _load_portfolio()
    holdings = portfolio.get("holdings", [])
    
    enriched = []
    for h in holdings:
        symbol = h["symbol"]
        try:
            quote = yf_svc.get_stock_quote(symbol)
            current_price = quote.get("price") or h["avg_buy_price"]
            prev_close = quote.get("previous_close") or current_price
            daily_change = ((current_price - prev_close) / prev_close * 100) if prev_close else 0
        except Exception:
            current_price = h["avg_buy_price"]
            daily_change = 0
        
        quantity = h["quantity"]
        avg_price = h["avg_buy_price"]
        current_value = quantity * current_price
        invested_value = quantity * avg_price
        pnl = current_value - invested_value
        pnl_percent = (pnl / invested_value * 100) if invested_value else 0
        
        enriched.append({
            "symbol": symbol,
            "quantity": quantity,
            "avg_buy_price": avg_price,
            "current_price": round(current_price, 2),
            "current_value": round(current_value, 2),
            "invested_value": round(invested_value, 2),
            "pnl": round(pnl, 2),
            "pnl_percent": round(pnl_percent, 2),
            "daily_change": round(daily_change, 2),
            "asset_type": h.get("asset_type", "equity"),
        })
    
    return enriched


def get_portfolio_summary() -> dict[str, Any]:
    """Get portfolio summary with totals and allocation."""
    portfolio = _load_portfolio()
    holdings = get_holdings()
    cash = portfolio.get("cash_balance", 0)
    
    total_invested = sum(h["invested_value"] for h in holdings)
    total_current = sum(h["current_value"] for h in holdings)
    total_pnl = total_current - total_invested
    total_pnl_percent = (total_pnl / total_invested * 100) if total_invested else 0
    
    total_assets = total_current + cash
    
    # Calculate allocation
    equity_value = sum(h["current_value"] for h in holdings if h["asset_type"] == "equity")
    
    allocation = {
        "equities": round((equity_value / total_assets * 100) if total_assets else 0, 2),
        "cash": round((cash / total_assets * 100) if total_assets else 0, 2),
    }
    
    # Calculate dividends YTD
    transactions = portfolio.get("transactions", [])
    current_year = datetime.now().year
    dividends_ytd = sum(
        t.get("amount", 0) 
        for t in transactions 
        if t.get("type") == "dividend" and str(current_year) in t.get("timestamp", "")
    )
    
    return {
        "total_assets": round(total_assets, 2),
        "total_invested": round(total_invested, 2),
        "total_current_value": round(total_current, 2),
        "total_pnl": round(total_pnl, 2),
        "total_pnl_percent": round(total_pnl_percent, 2),
        "cash_balance": round(cash, 2),
        "dividends_ytd": round(dividends_ytd, 2),
        "allocation": allocation,
        "holdings_count": len(holdings),
    }


def get_top_performers(limit: int = 5) -> list[dict[str, Any]]:
    """Get top performing holdings by daily change."""
    holdings = get_holdings()
    sorted_holdings = sorted(holdings, key=lambda x: x["daily_change"], reverse=True)
    return sorted_holdings[:limit]


def get_activity(limit: int = 10) -> list[dict[str, Any]]:
    """Get recent transactions."""
    portfolio = _load_portfolio()
    transactions = portfolio.get("transactions", [])
    sorted_txns = sorted(transactions, key=lambda x: x.get("timestamp", ""), reverse=True)
    return sorted_txns[:limit]


def add_holding(symbol: str, quantity: float, avg_buy_price: float, asset_type: str = "equity") -> dict[str, Any]:
    """Add a new holding or update existing."""
    portfolio = _load_portfolio()
    holdings = portfolio.get("holdings", [])
    
    # Check if holding exists
    for h in holdings:
        if h["symbol"] == symbol:
            # Update existing - calculate new average
            total_qty = h["quantity"] + quantity
            total_cost = (h["quantity"] * h["avg_buy_price"]) + (quantity * avg_buy_price)
            h["quantity"] = total_qty
            h["avg_buy_price"] = round(total_cost / total_qty, 2)
            _save_portfolio(portfolio)
            return {"message": f"Updated holding {symbol}", "holding": h}
    
    # Add new holding
    new_holding = {
        "symbol": symbol,
        "quantity": quantity,
        "avg_buy_price": avg_buy_price,
        "asset_type": asset_type,
    }
    holdings.append(new_holding)
    portfolio["holdings"] = holdings
    _save_portfolio(portfolio)
    
    return {"message": f"Added holding {symbol}", "holding": new_holding}


def remove_holding(symbol: str) -> dict[str, Any]:
    """Remove a holding."""
    portfolio = _load_portfolio()
    holdings = portfolio.get("holdings", [])
    
    original_len = len(holdings)
    holdings = [h for h in holdings if h["symbol"] != symbol]
    
    if len(holdings) == original_len:
        return {"error": f"Holding {symbol} not found"}
    
    portfolio["holdings"] = holdings
    _save_portfolio(portfolio)
    return {"message": f"Removed holding {symbol}"}


def update_holding(symbol: str, quantity: float | None = None, avg_buy_price: float | None = None) -> dict[str, Any]:
    """Update a holding's quantity or average price."""
    portfolio = _load_portfolio()
    holdings = portfolio.get("holdings", [])
    
    for h in holdings:
        if h["symbol"] == symbol:
            if quantity is not None:
                h["quantity"] = quantity
            if avg_buy_price is not None:
                h["avg_buy_price"] = avg_buy_price
            _save_portfolio(portfolio)
            return {"message": f"Updated holding {symbol}", "holding": h}
    
    return {"error": f"Holding {symbol} not found"}


def add_transaction(
    txn_type: str,
    symbol: str,
    quantity: float | None = None,
    price: float | None = None,
    amount: float | None = None,
) -> dict[str, Any]:
    """Add a transaction (buy/sell/dividend)."""
    portfolio = _load_portfolio()
    transactions = portfolio.get("transactions", [])
    
    txn = {
        "type": txn_type,
        "symbol": symbol,
        "timestamp": datetime.now().isoformat(),
    }
    
    if txn_type in ["buy", "sell"]:
        txn["quantity"] = quantity
        txn["price"] = price
    elif txn_type == "dividend":
        txn["amount"] = amount
    
    transactions.append(txn)
    portfolio["transactions"] = transactions
    _save_portfolio(portfolio)
    
    return {"message": "Transaction added", "transaction": txn}


def update_cash_balance(amount: float) -> dict[str, Any]:
    """Update cash balance."""
    portfolio = _load_portfolio()
    portfolio["cash_balance"] = amount
    _save_portfolio(portfolio)
    return {"message": "Cash balance updated", "cash_balance": amount}
