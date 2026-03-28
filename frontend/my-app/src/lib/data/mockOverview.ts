import type { OverviewData } from '@/lib/types/overview';

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA — Replace this file's export with a real API call when backend
// is ready. The shape must conform to OverviewData.
//
// Suggested swap:
//   export async function getOverviewData(): Promise<OverviewData> {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/overview`, {
//       next: { revalidate: 30 }, // ISR: re-fetch every 30s
//     });
//     if (!res.ok) throw new Error('Failed to fetch overview data');
//     return res.json();
//   }
// ─────────────────────────────────────────────────────────────────────────────

export const mockOverviewData: OverviewData = {
  portfolio: {
    totalAUM: 4285190,
    totalAUMCents: 42,
    quarterlyChangePercent: 12.4,
    cashFlow: 142000,
    dividendsYTD: 38412,
    riskScore: 4,
    riskLabel: 'Balanced',
    chartPoints: [80, 70, 85, 60, 40, 50, 35, 30, 20],
  },

  allocation: [
    { label: 'Equities (Stocks)',    percentage: 55, colorClass: 'bg-slate-800' },
    { label: 'Fixed Income (Bonds)', percentage: 25, colorClass: 'bg-sky-500' },
    { label: 'Cash & Equivalents',   percentage: 12, colorClass: 'bg-sky-300' },
    { label: 'Alternative / Crypto', percentage: 8,  colorClass: 'bg-slate-400' },
  ],

  holdings: [
    { id: 'aapl',  name: 'Apple Inc.',         ticker: 'AAPL',  price: 192.53, dailyChangePercent:  1.84 },
    { id: 'nvda',  name: 'NVIDIA Corporation',  ticker: 'NVDA',  price: 875.28, dailyChangePercent:  4.12 },
    { id: 'msft',  name: 'Microsoft Corp',      ticker: 'MSFT',  price: 415.10, dailyChangePercent:  0.95 },
    { id: 'googl', name: 'Alphabet Inc.',        ticker: 'GOOGL', price: 158.22, dailyChangePercent: -0.42 },
    { id: 'amzn',  name: 'Amazon.com Inc',       ticker: 'AMZN',  price: 185.07, dailyChangePercent:  1.15 },
  ],

  activity: [
    {
      id: 'act-1',
      type: 'trade',
      title: 'Buy Execution: NVDA',
      description: '24 Shares @ $868.50',
      timeLabel: '2 hours ago',
    },
    {
      id: 'act-2',
      type: 'news',
      title: 'Fed signals continued rate pause',
      description: 'The FOMC held rates steady, citing sticky inflation but resilient growth...',
      timeLabel: '5 hours ago',
    },
    {
      id: 'act-3',
      type: 'dividend',
      title: 'Dividend Received: AAPL',
      description: '+$412.50 credited to Cash Account',
      timeLabel: 'Yesterday',
    },
  ],

  insights: [
    {
      id: 'ins-1',
      variant: 'report',
      title: 'New Research Report: Tech Sector Resilience',
      description:
        'Our proprietary analysis indicates enterprise SaaS remains undervalued relative to historical cash flow multiples.',
      cta: 'Read Full Report',
    },
    {
      id: 'ins-2',
      variant: 'signal',
      badge: 'Buy Signal',
      title: 'NVDA Momentum Alert',
      description:
        'Regulatory shifts in sovereign AI infrastructure create a 12% upside potential based on adjusted 2024 guidance.',
      analystCount: 9,
    },
    {
      id: 'ins-3',
      variant: 'risk',
      badge: 'Market Risk Alert',
      title: 'Impending Rate Hike Impact',
      description:
        'Liquidity stress testing suggests shifting 15% of bond allocation to short-term treasuries to mitigate duration risk.',
      cta: 'Adjust Allocation',
    },
  ],

  insightsUpdatedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
};

// ─────────────────────────────────────────────────────────────────────────────
// Data-fetching function — swap the body here when backend is live
// ─────────────────────────────────────────────────────────────────────────────

export async function getOverviewData(): Promise<OverviewData> {
  // TODO: replace with real API call:
  // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/overview`);
  // if (!res.ok) throw new Error('Failed to fetch overview data');
  // return res.json();

  return mockOverviewData;
}
