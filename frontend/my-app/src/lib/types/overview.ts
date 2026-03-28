// ─── Portfolio Summary ────────────────────────────────────────────────────────

export interface PortfolioSummary {
  totalAUM: number;           // e.g. 4285190.42
  totalAUMCents: number;      // fractional cents portion, e.g. 42
  quarterlyChangePercent: number; // e.g. 12.4
  cashFlow: number;
  dividendsYTD: number;
  riskScore: number;          // 1–10
  riskLabel: string;          // e.g. "Balanced"
  chartPoints: number[];      // normalized Y values for sparkline (0–100)
}

// ─── Asset Allocation ────────────────────────────────────────────────────────

export interface AllocationItem {
  label: string;              // e.g. "Equities (Stocks)"
  percentage: number;         // e.g. 55
  colorClass: string;         // tailwind bg color class
}

// ─── Holdings ─────────────────────────────────────────────────────────────────

export interface Holding {
  id: string;
  name: string;               // e.g. "Apple Inc."
  ticker: string;             // e.g. "AAPL"
  price: number;              // e.g. 192.53
  dailyChangePercent: number; // e.g. 1.84 (positive = gain, negative = loss)
}

// ─── Recent Activity ─────────────────────────────────────────────────────────

export type ActivityType = 'trade' | 'news' | 'dividend' | 'alert';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timeLabel: string;          // e.g. "2 hours ago"
}

// ─── AI Insights ─────────────────────────────────────────────────────────────

export type InsightVariant = 'report' | 'signal' | 'risk';

export interface AIInsight {
  id: string;
  variant: InsightVariant;
  badge?: string;             // e.g. "Buy Signal", "Market Risk Alert"
  title: string;
  description: string;
  cta?: string;               // button label
  analystCount?: number;      // e.g. 9
}

// ─── Full Overview Payload ─────────────────────────────────────────────────────
// This is the shape your API endpoint should return at GET /api/overview

export interface OverviewData {
  portfolio: PortfolioSummary;
  allocation: AllocationItem[];
  holdings: Holding[];
  activity: ActivityItem[];
  insights: AIInsight[];
  insightsUpdatedAt: string;  // ISO date string, e.g. "2024-03-28T12:00:00Z"
}
