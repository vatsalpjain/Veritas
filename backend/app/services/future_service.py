import io
import datetime
import random
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import mplfinance as mpf
from fastapi import HTTPException
import math
from fastapi.responses import JSONResponse

from app.services import yfinance_service as yf_svc

def generate_future_chart(ticker: str) -> JSONResponse:
    try:
        # Get current price as starting point if available, else 100
        quote = yf_svc.get_stock_quote(ticker)
        raw_price = quote.get("price") if quote else None
        current_price = float(raw_price) if raw_price is not None else 150.0
    except Exception:
        current_price = 150.0

    # Generate 30 days of future OHLC data
    days = 30
    dates = pd.date_range(start=datetime.datetime.today(), periods=days)
    
    # Random walk simulation
    volatility = current_price * 0.02 # 2% daily volatility
    trend = current_price * 0.005 # slight positive expectations
    
    ohlc_data = []
    
    price = current_price
    for i in range(days):
        daily_move = random.gauss(trend, volatility)
        open_p = price
        close_p = price + daily_move
        high_p = max(open_p, close_p) + abs(random.gauss(0, volatility * 0.5))
        low_p = min(open_p, close_p) - abs(random.gauss(0, volatility * 0.5))
        
        # Format the date for lightweight-charts (YYYY-MM-DD string)
        current_date = dates[i].strftime('%Y-%m-%d')
        
        ohlc_data.append({
            "time": current_date,
            "open": round(open_p, 2),
            "high": round(high_p, 2),
            "low": round(low_p, 2),
            "close": round(close_p, 2)
        })
        
        price = close_p
        
    return JSONResponse(content={"ticker": ticker, "data": ohlc_data})
