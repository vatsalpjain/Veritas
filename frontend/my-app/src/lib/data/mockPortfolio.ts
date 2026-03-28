import type { PortfolioData } from '@/lib/types/portfolio';

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA — Single swap point: replace getPortfolioData() body with real calls.
//
// Backend integration plan (http://localhost:8000):
//
//   Step 1 — Fetch all holding quotes in one shot:
//     const quotes = await fetch(`${BASE}/yf/batch-quotes`, {
//       method: 'POST',
//       body: JSON.stringify({ symbols: ['AAPL', 'NVDA', 'MSFT', ...] })
//     }).then(r => r.json());
//
//   Step 2 — Get sector/fundamentals for bucketing into asset classes:
//     const fundamentals = await Promise.all(
//       symbols.map(s => fetch(`${BASE}/yf/fundamentals/${s}`).then(r => r.json()))
//     );
//     // Use fundamentals[i].sector to bucket → Domestic/International/Fixed Income/Cash
//
//   Step 3 — User profile (strategy, goals, targets): own backend DB endpoints
//     e.g. GET /api/user/portfolio-profile
//
//   Step 4 — Compute diversification score, allocation deltas, rebalancing on backend
//     or derive client-side from the above data.
//
// Response shape must conform to PortfolioData in src/lib/types/portfolio.ts
// ─────────────────────────────────────────────────────────────────────────────

export const mockPortfolioData: PortfolioData = {
  diversification: {
    score: 85,
    grade: 'EXCELLENT',
    headline: 'Your portfolio is well-defended against market volatility.',
    body: 'Based on your current holdings across 12 sectors and 4 asset classes, your concentration risk is minimized. We recommend slight adjustment in Emerging Markets to hit \'Optimal\'.',
    tags: ['LOW RISK', 'BALANCED GROWTH'],
    sectorCount: 12,
    assetClassCount: 4,
  },

  currentStrategy: {
    name: 'Moderate Growth',
    description: 'Designed for 7–10 year horizons with focus on capital preservation and steady yield.',
    ctaLabel: 'Change Strategy',
  },

  allocation: [
    {
      id: 'domestic-equity',
      label: 'Domestic Equity',
      icon: 'trending_up',
      currentPercent: 52,
      targetPercent: 45,
      status: 'OVERWEIGHT',
    },
    {
      id: 'international-equity',
      label: 'International Equity',
      icon: 'language',
      currentPercent: 21,
      targetPercent: 20,
      status: 'ALIGNED',
    },
    {
      id: 'fixed-income',
      label: 'Fixed Income',
      icon: 'account_balance',
      currentPercent: 18,
      targetPercent: 25,
      status: 'UNDERWEIGHT',
    },
    {
      id: 'cash-alternatives',
      label: 'Cash & Alternatives',
      icon: 'savings',
      currentPercent: 9,
      targetPercent: 10,
      status: 'ALIGNED',
    },
  ],

  rebalancing: [
    {
      id: 'reb-1',
      action: 'SELL',
      title: 'Reduce Information Technology',
      subtitle: 'Current overweight by 7.2% ($14,500)',
      amount: 5000,
      ctaLabel: 'VIEW POSITIONS',
    },
    {
      id: 'reb-2',
      action: 'BUY',
      title: 'Increase Emerging Markets',
      subtitle: 'Underweight in APAC region exposure',
      amount: 2000,
      ctaLabel: 'EXECUTE TRADE',
    },
    {
      id: 'reb-3',
      action: 'REALLOC',
      title: 'Diversify Large Cap Value',
      subtitle: 'Swap Vanguard ETF for ESG alternative',
      amount: 1200,
      ctaLabel: 'DETAILS',
    },
  ],

  strategyAdvisor: {
    label: 'Aggressive Growth',
    rationale: 'Based on your age (32) and high income-to-debt ratio, your risk tolerance supports an 85/15 equity-heavy split.',
    expectedReturnPA: 12.4,
    riskLevel: 'High',
    horizonYears: '15+ Years',
    equitySplit: 85,
    bondSplit: 15,
  },

  goals: [
    {
      id: 'retirement',
      icon: 'landscape',
      iconBg: '#e5eeff',
      iconColor: '#131b2e',
      label: 'RETIREMENT 2045',
      currentValue: 1240000,
      targetValue: 3500000,
      progressPercent: 35.4,
      status: 'On Track',
      statusColor: '#009668',
      progressBarColor: '#000000',
    },
    {
      id: 'education',
      icon: 'school',
      iconBg: '#eff4ff',
      iconColor: '#006591',
      label: 'EDUCATION FUND',
      currentValue: 85000,
      targetValue: 250000,
      progressPercent: 34,
      status: 'Behind',
      statusColor: '#94a3b8',
      ctaLabel: 'Increase contributions',
      progressBarColor: '#006591',
    },
    {
      id: 'vacation-home',
      icon: 'home',
      iconBg: '#f0fdf4',
      iconColor: '#009668',
      label: 'VACATION HOME',
      currentValue: 12000,
      targetValue: 150000,
      progressPercent: 8,
      status: 'Early stage',
      statusColor: '#94a3b8',
      progressBarColor: '#39b8fd',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Data-fetching function — swap body here when backend is live
// ─────────────────────────────────────────────────────────────────────────────

export async function getPortfolioData(): Promise<PortfolioData> {
  // TODO: replace with real API calls (see comments at top of file)
  // const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
  // ...
  return mockPortfolioData;
}
