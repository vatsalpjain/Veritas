from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from app.services import yfinance_service as yf_svc
from app.services import nse_service as nse_svc

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
