import type { InvestmentData, HistoryPeriod } from '@/lib/types/investment';

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA — Backend integration swap points are documented inline.
//
// When backend is ready, replace getInvestmentData() body with parallel fetches:
//
//   const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
//
//   const [aapl, voo, tsla, nvda, nee] = await Promise.all([
//     fetch(`${BASE}/yf/quote/AAPL`).then(r => r.json()),
//     fetch(`${BASE}/yf/quote/VOO`).then(r => r.json()),
//     fetch(`${BASE}/yf/quote/TSLA`).then(r => r.json()),
//     fetch(`${BASE}/yf/quote/NVDA`).then(r => r.json()),
//     fetch(`${BASE}/yf/quote/NEE`).then(r => r.json()),
//   ]);
//
//   const [aaplHist, vooHist, tslaHist] = await Promise.all([
//     fetch(`${BASE}/yf/history/AAPL?period=1mo&interval=1d`).then(r => r.json()),
//     fetch(`${BASE}/yf/history/VOO?period=1mo&interval=1d`).then(r => r.json()),
//     fetch(`${BASE}/yf/history/TSLA?period=1mo&interval=1d`).then(r => r.json()),
//   ]);
//
//   Then map the yfinance response shape to InvestmentData.
// ─────────────────────────────────────────────────────────────────────────────

// Sparklines: normalized Y values (0–20 scale, lower = higher on chart)
const SPARKLINE_UP    = [15, 12, 14, 10, 12, 8, 10, 5, 7, 2, 5];
const SPARKLINE_UP2   = [10, 12, 8, 9, 5, 2];
const SPARKLINE_DOWN  = [5, 10, 8, 15, 12, 18];

// Build OHLCV chart points for different periods (mock price series)
function buildHistory(base: number, count: number, trend: 'up' | 'wave') {
  return Array.from({ length: count }, (_, i) => {
    const progress = i / count;
    const noise = (Math.sin(i * 1.5) * 0.03 + Math.random() * 0.02 - 0.01);
    const trendFactor = trend === 'up' ? progress * 0.15 : Math.sin(progress * Math.PI) * 0.1;
    const close = base * (1 + trendFactor + noise);
    return {
      date: new Date(Date.now() - (count - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: close * 0.998,
      high: close * 1.005,
      low: close * 0.993,
      close,
      volume: Math.floor(Math.random() * 5_000_000 + 1_000_000),
    };
  });
}

export const mockInvestmentData: InvestmentData = {
  summary: {
    totalValue: 1248650.42,
    allTimeProfitAbs: 138402,
    allTimeProfitPercent: 12.4,
    dayChangeAbs: 8420.12,
    dayChangePercent: 0.68,
    buyingPower: 42190.50,
  },

  history: {
    '1M':  { period: '1M',  points: buildHistory(1_100_000, 22,  'wave'), peakValue: 1_280_000 },
    '3M':  { period: '3M',  points: buildHistory(1_050_000, 65,  'up'),   peakValue: 1_280_000 },
    '1Y':  { period: '1Y',  points: buildHistory(900_000,   252, 'up'),   peakValue: 1_280_000 },
    'ALL': { period: 'ALL', points: buildHistory(700_000,   500, 'up'),   peakValue: 1_280_000 },
  },

  breakdown: {
    targetPercent: 94.2,
    items: [
      { label: 'Stocks',       percentage: 65, color: '#000000' },
      { label: 'Mutual Funds', percentage: 25, color: '#006591' },
      { label: 'Bonds',        percentage: 10, color: '#39b8fd' },
    ],
  },

  holdings: [
    {
      id: 'aapl',
      ticker: 'AAPL',
      name: 'Apple Inc.',
      sector: 'Technology',
      shares: 450,
      costBasis: 162.40,
      currentPrice: 194.22,
      marketValue: 87399.00,
      returnPercent: 19.6,
      sparkline: SPARKLINE_UP,
    },
    {
      id: 'voo',
      ticker: 'VOO',
      name: 'Vanguard S&P 500',
      sector: 'ETF / Index',
      shares: 820,
      costBasis: 380.15,
      currentPrice: 432.10,
      marketValue: 354322.00,
      returnPercent: 13.7,
      sparkline: SPARKLINE_UP2,
    },
    {
      id: 'tsla',
      ticker: 'TSLA',
      name: 'Tesla, Inc.',
      sector: 'Automotive',
      shares: 110,
      costBasis: 215.00,
      currentPrice: 176.54,
      marketValue: 19419.40,
      returnPercent: -17.9,
      sparkline: SPARKLINE_DOWN,
    },
  ],

  opportunities: [
    {
      id: 'nvda',
      ticker: 'NVDA',
      name: 'NVIDIA Corp (NVDA)',
      signal: 'BUY',
      description: 'AI chip demand continues to outpace supply. Recent pullback provides entry.',
      currentPrice: 842.20,
      dayChangePercent: 2.4,
    },
    {
      id: 'nee',
      ticker: 'NEE',
      name: 'NextEra Energy (NEE)',
      signal: 'WATCH',
      description: 'Stable utility with strong renewables pipeline. Undervalued vs sector.',
      currentPrice: 62.15,
      dayChangePercent: -0.3,
    },
  ],

  riskAlert: {
    title: 'Portfolio Risk Alert',
    description: 'Your tech exposure is currently 15% above your target allocation.',
    ctaLabel: 'Rebalance Now',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Data-fetching function — swap body here when backend is live
// ─────────────────────────────────────────────────────────────────────────────

export async function getInvestmentData(): Promise<InvestmentData> {
  // TODO: replace with real parallel API calls to http://localhost:8000
  // See comments at the top of this file for the exact fetch pattern.
  return mockInvestmentData;
}

// Helper: fetch live quote for a single symbol (ready to use when backend is up)
export async function getLiveQuote(symbol: string) {
  const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
  const res = await fetch(`${BASE}/yf/quote/${symbol}`, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error(`Failed to fetch quote for ${symbol}`);
  return res.json();
}

// Helper: fetch history for a symbol
export async function getHistory(symbol: string, period: HistoryPeriod = '1M') {
  const periodMap: Record<HistoryPeriod, string> = {
    '1M': '1mo', '3M': '3mo', '1Y': '1y', 'ALL': 'max',
  };
  const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
  const res = await fetch(
    `${BASE}/yf/history/${symbol}?period=${periodMap[period]}&interval=1d`,
    { next: { revalidate: 60 } },
  );
  if (!res.ok) throw new Error(`Failed to fetch history for ${symbol}`);
  return res.json();
}
