import type { OverviewData, AllocationItem } from '@/lib/types/overview';
import { apiFetch, REVALIDATE } from '@/lib/api/client';
import type {
  RawPortfolioSummary,
  RawTopPerformer,
  RawActivity,
  RawInsight,
  RawRiskScore,
} from '@/lib/api/types';

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
// Mapper helpers
// ─────────────────────────────────────────────────────────────────────────────

function mapAllocation(raw: Record<string, number>): AllocationItem[] {
  const colorMap: Record<string, string> = {
    equities: 'bg-slate-800',
    cash:     'bg-sky-300',
    bonds:    'bg-sky-500',
    crypto:   'bg-slate-400',
    others:   'bg-slate-300',
  };
  const labelMap: Record<string, string> = {
    equities: 'Equities (Stocks)',
    cash:     'Cash & Equivalents',
    bonds:    'Fixed Income (Bonds)',
    crypto:   'Alternative / Crypto',
    others:   'Others',
  };
  return Object.entries(raw).map(([key, pct]) => ({
    label:      labelMap[key] ?? key,
    percentage: pct,
    colorClass: colorMap[key] ?? 'bg-slate-400',
  }));
}

function mapActivityType(raw: string): 'trade' | 'news' | 'dividend' | 'alert' {
  if (raw === 'buy' || raw === 'sell') return 'trade';
  if (raw === 'dividend') return 'dividend';
  if (raw === 'news') return 'news';
  return 'alert';
}

function relativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  return 'Yesterday';
}

function mapInsightVariant(type: string): 'report' | 'signal' | 'risk' {
  if (type === 'buy_signal')     return 'signal';
  if (type === 'risk_alert')     return 'risk';
  return 'report';
}

// ─────────────────────────────────────────────────────────────────────────────
// Data-fetching function — calls real backend, falls back to mock on error
// ─────────────────────────────────────────────────────────────────────────────

export async function getOverviewData(): Promise<OverviewData> {
  try {
    // Parallel fetch all required endpoints
    const [summary, performers, activity, insights, riskScore] = await Promise.all([
      apiFetch<RawPortfolioSummary>('/portfolio/summary', { revalidate: REVALIDATE.LIVE }),
      apiFetch<RawTopPerformer[]>('/portfolio/top-performers?limit=5', { revalidate: REVALIDATE.LIVE }),
      apiFetch<RawActivity[]>('/portfolio/activity?limit=10', { revalidate: REVALIDATE.LIVE }),
      apiFetch<RawInsight[]>('/insights', { revalidate: REVALIDATE.SLOW }),
      apiFetch<RawRiskScore>('/insights/risk-score', { revalidate: REVALIDATE.SLOW }),
    ]);

    return {
      portfolio: {
        totalAUM:               summary.total_current_value,
        totalAUMCents:          Math.round((summary.total_current_value % 1) * 100),
        quarterlyChangePercent: summary.total_pnl_percent,
        cashFlow:               summary.total_pnl,
        dividendsYTD:           summary.dividends_ytd,
        riskScore:              riskScore.score,
        riskLabel:              riskScore.label,
        chartPoints:            [80, 70, 85, 60, 40, 50, 35, 30, 20], // static decorative
      },

      allocation: mapAllocation(summary.allocation),

      holdings: performers.map(p => ({
        id:                 p.symbol,
        name:               p.symbol.replace('.NS', ''),
        ticker:             p.symbol.replace('.NS', ''),
        price:              p.current_price,
        dailyChangePercent: p.daily_change,
      })),

      activity: activity.map((a, i) => ({
        id:          a.id ?? `activity-${i}-${a.title?.slice(0, 10) ?? i}`,
        type:        mapActivityType(a.type),
        title:       a.title,
        description: a.description,
        timeLabel:   a.timestamp ? relativeTime(a.timestamp) : 'Recently',
      })),

      insights: insights.map((ins, i) => ({
        id:            ins.id ?? `insight-${i}-${ins.type ?? i}`,
        variant:       mapInsightVariant(ins.type),
        badge:         ins.type === 'buy_signal' ? 'Buy Signal' : ins.type === 'risk_alert' ? 'Market Risk Alert' : undefined,
        title:         ins.title,
        description:   ins.summary,
        cta:           ins.action_label,
        analystCount:  ins.analysts_agree,
      })),

      insightsUpdatedAt: insights[0]?.timestamp ?? new Date().toISOString(),
    };
  } catch (err) {
    console.warn('[Overview] Backend unavailable, using mock data:', (err as Error).message);
    return mockOverviewData;
  }
}
