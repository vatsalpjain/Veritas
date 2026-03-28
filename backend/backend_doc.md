# CodeCrafters Backend Documentation

> **Source of Truth** for backend API and system info. Frontend devs: read this before integrating.

---

## System Overview

| Item | Value |
|------|-------|
| Framework | FastAPI |
| Python | 3.13 |
| Package Manager | uv |
| Port | 8000 |
| Base URL | `http://localhost:8000` |

---

## Running the Backend

```bash
cd backend
uv sync              # Install dependencies
uv run python main.py   # Start server with hot reload
```

---

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # All API routes
│   └── services/
│       ├── yfinance_service.py   # yfinance data fetching
│       └── nse_service.py        # NSE India direct API
├── main.py                  # Entry point
├── pyproject.toml
└── backend_doc.md
```

---

## Data Sources

### 1. yfinance (`/yf/...`)
- Global stock data (works for US, India with `.NS` suffix, etc.)
- Fundamentals, financials, options, history
- Use for: historical data, fundamentals, global stocks

### 2. NSE India (`/nse/...`)
- Direct NSE India API
- Real-time Indian market data
- Use for: live Nifty 50, NSE indices, Indian options chains

---

## API Endpoints

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |

---

### yfinance Endpoints (`/yf/...`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/yf/quote/{symbol}` | Live quote (price, volume, etc.) |
| GET | `/yf/fundamentals/{symbol}` | PE, EPS, sector, 52w high/low |
| GET | `/yf/history/{symbol}?period=1mo&interval=1d` | OHLCV history |
| GET | `/yf/financials/{symbol}` | Income, balance sheet, cashflow |
| GET | `/yf/earnings/{symbol}` | Earnings dates |
| GET | `/yf/recommendations/{symbol}` | Analyst ratings |
| POST | `/yf/batch-quotes` | Multiple symbols at once |
| GET | `/yf/index/{symbol}` | Index quote (^NSEI, ^BSESN) |
| GET | `/yf/index-history/{symbol}` | Index OHLCV history |
| GET | `/yf/options/{symbol}?expiry=` | Option chain |
| GET | `/yf/option-expiries/{symbol}` | Available expiries |
| GET | `/yf/iv-surface/{symbol}` | IV across all strikes/expiries |

**Symbol format for Indian stocks:** `RELIANCE.NS`, `TCS.NS`, `INFY.NS`
**Index symbols:** `^NSEI` (Nifty 50), `^BSESN` (Sensex), `^NSEBANK` (Bank Nifty)

**History params:**
- `period`: 1d, 5d, 1mo, 3mo, 6mo, 1y, 5y, max
- `interval`: 1m, 5m, 15m, 1h, 1d, 1wk, 1mo

---

### NSE India Endpoints (`/nse/...`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/nse/quote/{symbol}` | Live NSE quote |
| GET | `/nse/indices` | All NSE indices |
| GET | `/nse/nifty50` | All Nifty 50 stocks live |
| GET | `/nse/market-status` | Market open/closed status |
| GET | `/nse/options/{symbol}?is_index=true` | Option chain |
| GET | `/nse/pcr/{symbol}?is_index=true` | Put-Call Ratio |
| GET | `/nse/iv-surface/{symbol}?is_index=true` | IV surface |

**Symbol format:** `RELIANCE`, `TCS`, `NIFTY`, `BANKNIFTY` (no suffix)
**is_index:** `true` for NIFTY/BANKNIFTY, `false` for stocks

---

## Response Examples

### `/yf/quote/RELIANCE.NS`
```json
{
  "symbol": "RELIANCE.NS",
  "price": 2450.50,
  "previous_close": 2440.00,
  "open": 2445.00,
  "day_high": 2460.00,
  "day_low": 2435.00,
  "volume": 5000000,
  "market_cap": 16500000000000
}
```

### `/nse/quote/RELIANCE`
```json
{
  "symbol": "RELIANCE",
  "price": 2450.50,
  "open": 2445.00,
  "previous_close": 2440.00,
  "day_high": 2460.00,
  "day_low": 2435.00,
  "week_high": 2600.00,
  "week_low": 2200.00,
  "volume": 5000000,
  "change": 10.50,
  "change_percent": 0.43,
  "industry": "Refineries",
  "isin": "INE002A01018"
}
```

### `/nse/nifty50`
```json
[
  {
    "symbol": "RELIANCE",
    "price": 2450.50,
    "change": 10.50,
    "change_percent": 0.43,
    "volume": 5000000
  },
  ...
]
```

### `/nse/pcr/NIFTY`
```json
{
  "symbol": "NIFTY",
  "pcr": 1.2345,
  "total_call_oi": 10000000,
  "total_put_oi": 12345000
}
```

---

## Error Handling

All endpoints return errors as:
```json
{
  "error": "error message"
}
```

NSE endpoints may fail if market is closed or session expires (auto-retries 3 times).

---

## CORS

Enabled for all origins (`*`). Frontend can call from any domain.

---

## Dependencies

```bash
uv add package-name   # Add new package
```

Current:
- `fastapi` - Web framework
- `uvicorn[standard]` - ASGI server
- `yfinance` - Yahoo Finance data
- `requests` - HTTP client for NSE

---

## Notes for Frontend

1. **Base URL**: `http://localhost:8000`
2. **Swagger UI**: `http://localhost:8000/docs`
3. **All responses are JSON**
4. **No auth required**
5. **NSE endpoints may be slower** (session warmup)
6. **Use yfinance for historical data**, NSE for real-time Indian data

---

## Changelog

| Date | Change |
|------|--------|
| Initial | Basic setup with health endpoint |
| Update | Added yfinance + NSE data ingestion |

---

*Last updated: Auto-generated*
