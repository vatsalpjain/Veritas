from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.services import yfinance_service as yf_svc
from app.services import nse_service as nse_svc
from app.services import portfolio_service as portfolio_svc
from app.services import insights_service as insights_svc
from app.services import investments_service as investments_svc
from app.services import news_service as news_svc


# Pydantic models for request bodies
class HoldingCreate(BaseModel):
    symbol: str
    quantity: float
    avg_buy_price: float
    asset_type: str = "equity"


class HoldingUpdate(BaseModel):
    quantity: float | None = None
    avg_buy_price: float | None = None


class TransactionCreate(BaseModel):
    type: str  # buy, sell, dividend
    symbol: str
    quantity: float | None = None
    price: float | None = None
    amount: float | None = None


class CashUpdate(BaseModel):
    amount: float

app = FastAPI(title="CodeCrafters API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


# ============== YFINANCE ENDPOINTS ==============

@app.get("/yf/quote/{symbol}")
async def yf_quote(symbol: str):
    """Get live quote via yfinance."""
    return yf_svc.get_stock_quote(symbol)


@app.get("/yf/fundamentals/{symbol}")
async def yf_fundamentals(symbol: str):
    """Get fundamentals via yfinance."""
    return yf_svc.get_stock_fundamentals(symbol)


@app.get("/yf/history/{symbol}")
async def yf_history(
    symbol: str,
    period: str = Query("1mo", description="1d,5d,1mo,3mo,6mo,1y,5y,max"),
    interval: str = Query("1d", description="1m,5m,15m,1h,1d,1wk,1mo"),
):
    """Get OHLCV history via yfinance."""
    return yf_svc.get_stock_history(symbol, period, interval)


@app.get("/yf/financials/{symbol}")
async def yf_financials(symbol: str):
    """Get financial statements via yfinance."""
    return yf_svc.get_financials(symbol)


@app.get("/yf/earnings/{symbol}")
async def yf_earnings(symbol: str):
    """Get earnings dates via yfinance."""
    return yf_svc.get_earnings(symbol)


@app.get("/yf/recommendations/{symbol}")
async def yf_recommendations(symbol: str):
    """Get analyst recommendations via yfinance."""
    return yf_svc.get_recommendations(symbol)


@app.post("/yf/batch-quotes")
async def yf_batch_quotes(symbols: list[str]):
    """Get quotes for multiple symbols."""
    return yf_svc.get_batch_quotes(symbols)


@app.get("/yf/index/{symbol}")
async def yf_index(symbol: str):
    """Get index quote (^NSEI, ^BSESN, ^NSEBANK)."""
    return yf_svc.get_index_quote(symbol)


@app.get("/yf/index-history/{symbol}")
async def yf_index_history(
    symbol: str,
    period: str = Query("1mo"),
    interval: str = Query("1d"),
):
    """Get index history."""
    return yf_svc.get_index_history(symbol, period, interval)


@app.get("/yf/options/{symbol}")
async def yf_options(symbol: str, expiry: str | None = None):
    """Get option chain via yfinance."""
    return yf_svc.get_option_chain(symbol, expiry)


@app.get("/yf/option-expiries/{symbol}")
async def yf_option_expiries(symbol: str):
    """Get available option expiries."""
    return yf_svc.get_option_expiries(symbol)


@app.get("/yf/iv-surface/{symbol}")
async def yf_iv_surface(symbol: str):
    """Get IV surface via yfinance."""
    return yf_svc.get_iv_surface(symbol)


# ============== NSE INDIA ENDPOINTS ==============

@app.get("/nse/quote/{symbol}")
async def nse_quote(symbol: str):
    """Get live NSE quote."""
    return nse_svc.get_stock_quote(symbol)


@app.get("/nse/indices")
async def nse_indices():
    """Get all NSE indices."""
    return nse_svc.get_all_indices()


@app.get("/nse/nifty50")
async def nse_nifty50():
    """Get all Nifty 50 stocks live data."""
    return nse_svc.get_nifty50_stocks()


@app.get("/nse/market-status")
async def nse_market_status():
    """Get NSE market status."""
    return nse_svc.get_market_status()


@app.get("/nse/options/{symbol}")
async def nse_options(symbol: str, is_index: bool = True):
    """Get NSE option chain."""
    return nse_svc.get_option_chain(symbol, is_index)


@app.get("/nse/pcr/{symbol}")
async def nse_pcr(symbol: str, is_index: bool = True):
    """Get Put-Call Ratio."""
    return nse_svc.get_pcr(symbol, is_index)


@app.get("/nse/iv-surface/{symbol}")
async def nse_iv_surface(symbol: str, is_index: bool = True):
    """Get IV surface from NSE."""
    return nse_svc.get_iv_surface(symbol, is_index)


# ============== PORTFOLIO ENDPOINTS ==============

@app.get("/portfolio")
async def get_portfolio():
    """Get full portfolio with live prices."""
    return portfolio_svc.get_holdings()


@app.get("/portfolio/summary")
async def get_portfolio_summary():
    """Get portfolio summary with totals and allocation."""
    return portfolio_svc.get_portfolio_summary()


@app.get("/portfolio/top-performers")
async def get_top_performers(limit: int = Query(5)):
    """Get top performing holdings by daily change."""
    return portfolio_svc.get_top_performers(limit)


@app.get("/portfolio/activity")
async def get_activity(limit: int = Query(10)):
    """Get recent transactions."""
    return portfolio_svc.get_activity(limit)


@app.post("/portfolio/holding")
async def add_holding(holding: HoldingCreate):
    """Add a new holding."""
    return portfolio_svc.add_holding(
        holding.symbol,
        holding.quantity,
        holding.avg_buy_price,
        holding.asset_type,
    )


@app.put("/portfolio/holding/{symbol}")
async def update_holding(symbol: str, holding: HoldingUpdate):
    """Update a holding."""
    return portfolio_svc.update_holding(symbol, holding.quantity, holding.avg_buy_price)


@app.delete("/portfolio/holding/{symbol}")
async def remove_holding(symbol: str):
    """Remove a holding."""
    return portfolio_svc.remove_holding(symbol)


@app.post("/portfolio/transaction")
async def add_transaction(txn: TransactionCreate):
    """Add a transaction (buy/sell/dividend)."""
    return portfolio_svc.add_transaction(
        txn.type,
        txn.symbol,
        txn.quantity,
        txn.price,
        txn.amount,
    )


@app.put("/portfolio/cash")
async def update_cash(cash: CashUpdate):
    """Update cash balance."""
    return portfolio_svc.update_cash_balance(cash.amount)


# ============== INSIGHTS ENDPOINTS ==============

@app.get("/insights")
async def get_insights():
    """Get AI-driven insights."""
    return insights_svc.get_ai_insights()


@app.get("/insights/risk-score")
async def get_risk_score():
    """Get portfolio risk score."""
    holdings = portfolio_svc.get_holdings()
    return insights_svc.get_risk_score(holdings)


@app.get("/insights/rebalancing")
async def get_rebalancing():
    """Get rebalancing suggestions."""
    holdings = portfolio_svc.get_holdings()
    summary = portfolio_svc.get_portfolio_summary()
    return insights_svc.get_rebalancing_suggestions(holdings, summary.get("allocation", {}))


# ============== INVESTMENTS PAGE ENDPOINTS ==============

@app.get("/investments/stats")
async def get_investment_stats():
    """Get investment page top stats (total value, profit, day's change, buying power)."""
    return investments_svc.get_investment_stats()


@app.get("/investments/holdings")
async def get_holdings_table():
    """Get holdings table with trend sparkline data."""
    return investments_svc.get_holdings_table()


@app.get("/investments/performance")
async def get_performance_history(period: str = Query("1M", description="1M, 3M, 1Y, ALL")):
    """Get portfolio performance history for chart."""
    return investments_svc.get_performance_history(period)


@app.get("/investments/breakdown")
async def get_asset_breakdown():
    """Get asset breakdown for pie chart."""
    return investments_svc.get_asset_breakdown()


@app.get("/investments/opportunities")
async def get_opportunities():
    """Get investment opportunities (mock)."""
    return investments_svc.get_opportunities()


@app.get("/investments/alerts")
async def get_portfolio_alerts():
    """Get portfolio risk alerts."""
    return investments_svc.get_portfolio_alerts()


# ============== NEWS ENDPOINTS ==============

@app.get("/news")
async def get_news(
    category: str | None = Query(None, description="Filter by category: macro, equity, commodity, crypto"),
    ticker: str | None = Query(None, description="Filter by ticker symbol"),
    limit: int = Query(20, description="Max articles to return"),
    refresh: bool = Query(False, description="Force refresh from API"),
):
    """Get news articles with optional filters."""
    return news_svc.get_news(category=category, ticker=ticker, limit=limit, refresh=refresh)


@app.post("/news/refresh")
async def refresh_news():
    """Force refresh news from Finnhub API."""
    return news_svc.fetch_and_store()


@app.get("/news/flashcards")
async def get_news_flashcards(refresh: bool = Query(False)):
    """Get lightweight news flashcards for UI ticker."""
    return news_svc.get_flashcards(refresh=refresh)


@app.get("/news/sentiment")
async def get_news_sentiment(refresh: bool = Query(False)):
    """Get aggregated sentiment summary by category and ticker."""
    return news_svc.get_sentiment_summary(refresh=refresh)


@app.get("/news/ticker/{ticker}")
async def get_ticker_news(ticker: str, limit: int = Query(10)):
    """Get news for a specific ticker."""
    return news_svc.get_ticker_news(ticker=ticker, limit=limit)
