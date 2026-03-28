# Reports Page - Backend API Endpoints Documentation

## Overview
This document lists all the backend endpoints required for the **Reports Page** (`/reports` route). The frontend UI has been fully implemented and is ready to consume these APIs.

---

## 🎯 Required Endpoints

### 1. **GET /api/reports/summary**
**Purpose:** Fetch the top-level KPI summary cards

**Response:**
```json
{
  "total_portfolio_value": 4285190,
  "total_portfolio_value_change_percent": 12.4,
  "realised_pnl": 384200,
  "unrealised_pnl": 138402,
  "dividends_ytd": 38412,
  "dividend_holdings_count": 6,
  "xirr": 18.4
}
```

**Frontend Usage:** ReportsHero component KPI cards

---

### 2. **GET /api/reports/daily-pnl**
**Purpose:** Fetch daily P&L data for the calendar heatmap

**Query Parameters:**
- `month` (optional): e.g., `2025-03` (defaults to current month)
- `year` (optional): e.g., `2025` (defaults to current year)

**Response:**
```json
{
  "month": "March 2025",
  "days": [
    {
      "date": "2025-03-01",
      "pnl": 0,
      "category": "neutral"
    },
    {
      "date": "2025-03-03",
      "pnl": 8420,
      "category": "profit-2"
    },
    {
      "date": "2025-03-05",
      "pnl": -2100,
      "category": "loss-1"
    }
  ]
}
```

**Categories:**
- `profit-3`: Strong gain (>₹15,000)
- `profit-2`: Good gain (₹7,000 - ₹15,000)
- `profit-1`: Small gain (₹1,000 - ₹7,000)
- `neutral`: Flat (₹-1,000 to ₹1,000)
- `loss-1`: Small loss (₹-7,000 to ₹-1,000)
- `loss-2`: Moderate loss (₹-15,000 to ₹-7,000)
- `loss-3`: Heavy loss (<₹-15,000)

**Frontend Usage:** PLCalendar component

---

### 3. **GET /api/reports/active-holdings**
**Purpose:** Fetch all active (open) holdings with full details

**Query Parameters:**
- `period` (optional): `1M`, `3M`, `6M`, `1Y`, `All` (defaults to `1M`)

**Response:**
```json
{
  "holdings": [
    {
      "id": "aapl-001",
      "name": "Apple Inc.",
      "ticker": "AAPL",
      "type": "equity",
      "buy_price": 162.40,
      "buy_date": "2024-01-12",
      "quantity": 450,
      "current_price": 194.22,
      "invested_value": 73080,
      "market_value": 87399,
      "pnl": 14319,
      "pnl_percent": 19.6,
      "trend": "up"
    }
  ]
}
```

**Asset Types:**
- `equity`: Stock
- `etf`: ETF
- `mf`: Mutual Fund
- `bond`: Bond
- `crypto`: Cryptocurrency

**Frontend Usage:** ActiveHoldingsTable component

---

### 4. **GET /api/reports/asset-allocation**
**Purpose:** Fetch asset class distribution for donut chart

**Response:**
```json
{
  "allocation": [
    {
      "class": "equity",
      "label": "Equities",
      "percentage": 55,
      "value": 2357000,
      "color": "#131b2e"
    },
    {
      "class": "mutual_funds",
      "label": "Mutual Funds",
      "percentage": 20,
      "value": 857000,
      "color": "#006591"
    },
    {
      "class": "bonds",
      "label": "Bonds",
      "percentage": 15,
      "value": 643000,
      "color": "#39b8fd"
    },
    {
      "class": "crypto",
      "label": "Crypto",
      "percentage": 10,
      "value": 429000,
      "color": "#4edea3"
    }
  ]
}
```

**Frontend Usage:** AssetAllocation component

---

### 5. **GET /api/reports/sector-exposure**
**Purpose:** Fetch sector-wise portfolio concentration

**Response:**
```json
{
  "sectors": [
    {
      "name": "Technology",
      "percentage": 42,
      "value": 1799778,
      "is_overweight": true
    },
    {
      "name": "Financials",
      "percentage": 18,
      "value": 771333,
      "is_overweight": false
    },
    {
      "name": "Healthcare",
      "percentage": 12,
      "value": 514222,
      "is_overweight": false
    },
    {
      "name": "Energy",
      "percentage": 10,
      "value": 428519,
      "is_overweight": false
    },
    {
      "name": "Real Estate",
      "percentage": 8,
      "value": 342815,
      "is_overweight": false
    },
    {
      "name": "Others",
      "percentage": 10,
      "value": 428519,
      "is_overweight": false
    }
  ]
}
```

**Note:** `is_overweight` = true if percentage > 35%

**Frontend Usage:** SectorExposure component

---

### 6. **GET /api/reports/tax-summary**
**Purpose:** Fetch tax liability breakdown for the financial year

**Query Parameters:**
- `fy` (optional): e.g., `2024-25` (defaults to current FY)

**Response:**
```json
{
  "financial_year": "2024-25",
  "stcg_tax": {
    "amount": 28400,
    "gains": 189333,
    "rate": 15
  },
  "ltcg_tax": {
    "amount": 19420,
    "gains": 194200,
    "rate": 10
  },
  "tax_loss_offset": {
    "amount": -12600,
    "description": "Saved via TLH strategy"
  },
  "net_tax_due": 35220,
  "due_date": "2025-03-31",
  "tlh_opportunity": {
    "ticker": "TSLA",
    "shares": 110,
    "potential_savings": 42000,
    "description": "Selling 110 shares of TSLA at current price saves you ₹42,000 in tax this year while maintaining market exposure via a correlated ETF."
  }
}
```

**Frontend Usage:** TaxSummary component

---

### 7. **GET /api/reports/dividends**
**Purpose:** Fetch dividend and interest income history

**Query Parameters:**
- `period` (optional): `1M`, `3M`, `6M`, `1Y`, `YTD`, `All` (defaults to `YTD`)

**Response:**
```json
{
  "total_ytd": 38412,
  "dividends": [
    {
      "id": "div-001",
      "ticker": "AAPL",
      "name": "Apple Inc.",
      "date": "2025-03-15",
      "type": "Dividend",
      "amount": 4120,
      "status": "credited"
    },
    {
      "id": "div-002",
      "ticker": "VOO",
      "name": "Vanguard S&P 500",
      "date": "2025-02-28",
      "type": "Dividend",
      "amount": 18200,
      "status": "credited"
    },
    {
      "id": "int-001",
      "ticker": "SGB",
      "name": "SGB 2.5% 2031",
      "date": "2025-02-15",
      "type": "Interest",
      "amount": 6775,
      "status": "credited"
    },
    {
      "id": "div-003",
      "ticker": "HDFC",
      "name": "HDFC Flexi Cap",
      "date": "2025-01-10",
      "type": "IDCW Payout",
      "amount": 9317,
      "status": "credited"
    }
  ]
}
```

**Types:**
- `Dividend`: Equity/ETF dividend
- `Interest`: Bond/FD interest
- `IDCW Payout`: Mutual fund income distribution

**Frontend Usage:** DividendHistory component

---

### 8. **GET /api/reports/closed-positions**
**Purpose:** Fetch all sold/closed positions

**Query Parameters:**
- `period` (optional): `1M`, `3M`, `6M`, `1Y`, `All` (defaults to `1Y`)

**Response:**
```json
{
  "positions": [
    {
      "id": "closed-001",
      "name": "Tesla Inc.",
      "ticker": "TSLA",
      "type": "equity",
      "buy_price": 215.00,
      "buy_date": "2024-01-05",
      "sell_price": 176.54,
      "sell_date": "2025-03-18",
      "quantity": 110,
      "invested_value": 23650,
      "proceeds": 19419.40,
      "pnl": -4230.60,
      "pnl_percent": -17.9,
      "xirr": -15.2,
      "holding_period_days": 438
    },
    {
      "id": "closed-002",
      "name": "Reliance Ind.",
      "ticker": "RELI",
      "type": "equity",
      "buy_price": 2340,
      "buy_date": "2022-07-12",
      "sell_price": 2980,
      "sell_date": "2025-01-10",
      "quantity": 50,
      "invested_value": 117000,
      "proceeds": 149000,
      "pnl": 32000,
      "pnl_percent": 27.4,
      "xirr": 22.8,
      "holding_period_days": 912
    }
  ]
}
```

**Frontend Usage:** ClosedPositions component

---

### 9. **GET /api/reports/ai-portfolio-doctor**
**Purpose:** Fetch AI-powered portfolio analysis and recommendations

**Response:**
```json
{
  "score": 72,
  "max_score": 100,
  "analysis_date": "2025-03-28",
  "critical_issues": [
    "Tech sector overweight by 18% vs target",
    "Fixed income underweight — rate risk exposure high"
  ],
  "strengths": [
    "Excellent diversification across 4 asset classes",
    "XIRR 18.4% beats Nifty 50 by 4.2%"
  ],
  "prescriptions": [
    "Buy 2 units LIQUIDBEES (₹8,000)",
    "Trim HDFCBANK by 8% before Apr 5 RBI policy"
  ],
  "detailed_analysis": {
    "diversification_score": 85,
    "risk_score": 68,
    "performance_score": 78,
    "tax_efficiency_score": 65
  }
}
```

**Frontend Usage:** AIPortfolioDoctor component

---

### 10. **POST /api/reports/email**
**Purpose:** Send report via email

**Request Body:**
```json
{
  "recipient_email": "user@example.com",
  "report_type": "full_portfolio",
  "period": "1M",
  "format": "pdf"
}
```

**Report Types:**
- `full_portfolio`: Complete report
- `active_holdings`: Active holdings only
- `tax_summary`: Tax summary report
- `dividend_income`: Dividend income report
- `ai_doctor`: AI Doctor report

**Response:**
```json
{
  "success": true,
  "message": "Report sent successfully to user@example.com",
  "email_id": "email-12345"
}
```

**Frontend Usage:** Email modal (future implementation)

---

## 📊 Data Aggregation Notes

### Period Filtering
Most endpoints support a `period` query parameter:
- `1M`: Last 1 month
- `3M`: Last 3 months
- `6M`: Last 6 months
- `1Y`: Last 1 year
- `YTD`: Year to date
- `All`: All time

### Currency Format
- All monetary values are in **INR (₹)**
- Return values as **numbers** (frontend handles formatting)
- Example: `4285190` (not `"₹42,85,190"`)

### Date Format
- Use **ISO 8601** format: `YYYY-MM-DD`
- Example: `"2025-03-28"`

### Percentage Values
- Return as **decimal numbers** (not percentages)
- Example: `12.4` (means 12.4%)

---

## 🔄 Caching Strategy

### Recommended Cache Times
- **Summary KPIs**: 30 seconds (high frequency updates)
- **Daily P&L**: 5 minutes (updates once per day)
- **Active Holdings**: 1 minute (live price changes)
- **Asset Allocation**: 5 minutes (changes infrequently)
- **Sector Exposure**: 5 minutes (changes infrequently)
- **Tax Summary**: 1 hour (static for most of the year)
- **Dividends**: 1 hour (updates monthly)
- **Closed Positions**: 1 hour (historical data)
- **AI Doctor**: 15 minutes (computationally expensive)

---

## 🚀 Priority Order for Implementation

1. **High Priority** (Core functionality):
   - GET /api/reports/summary
   - GET /api/reports/active-holdings
   - GET /api/reports/asset-allocation
   - GET /api/reports/sector-exposure

2. **Medium Priority** (Important features):
   - GET /api/reports/daily-pnl
   - GET /api/reports/dividends
   - GET /api/reports/closed-positions

3. **Low Priority** (Nice to have):
   - GET /api/reports/tax-summary
   - GET /api/reports/ai-portfolio-doctor
   - POST /api/reports/email

---

## 📝 Notes for Backend Developer

1. **Data Sources:**
   - Portfolio holdings from `portfolio_service`
   - Live prices from `yfinance_service`
   - Historical data from database
   - Tax calculations based on Indian tax rules (STCG 15%, LTCG 10%)

2. **Calculations:**
   - **XIRR**: Use standard XIRR formula for annualized returns
   - **P&L**: `(current_price - buy_price) * quantity`
   - **Market Value**: `current_price * quantity`
   - **Invested Value**: `buy_price * quantity`

3. **Error Handling:**
   - Return 404 if no data found for period
   - Return 500 for calculation errors
   - Include meaningful error messages

4. **Performance:**
   - Use database indexes on `date`, `ticker`, `type` fields
   - Consider pre-computing daily P&L at EOD
   - Cache AI Doctor analysis results

---

## ✅ Frontend Status

**All UI components are complete and ready!**

The frontend is currently using **mock data** and will automatically switch to real data once these endpoints are implemented. No frontend changes required - just implement the endpoints with the exact response formats specified above.

---

## 🤝 Questions?

If you need clarification on any endpoint or response format, please reach out. The frontend is flexible and can adapt to minor changes in the API structure if needed.
