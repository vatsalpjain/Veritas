/* ── Veritas Agent Types ─────────────────────────────────────────────────── */

export interface ThinkingStep {
  step: string;
  tool: string | null;
  status: 'running' | 'done' | 'error';
}

export interface SourceReference {
  type: 'news' | 'market_data' | 'web_search' | 'portfolio' | 'filing';
  title: string;
  url: string | null;
  snippet: string;
  confidence: number | null;
}

export interface DataSnapshot {
  type: 'stock_quote' | 'metric' | 'chart_data' | 'sentiment' | 'portfolio_summary';
  label: string;
  data: Record<string, unknown>;
}

export interface VerificationResult {
  raw_analysis: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  thinkingSteps?: ThinkingStep[];
  sources?: SourceReference[];
  dataSnapshots?: DataSnapshot[];
  verification?: VerificationResult | null;
}

/* ── SSE Event types ─────────────────────────────────────────────────────── */

export type SSEEvent =
  | { type: 'thinking'; step: string; tool: string | null; status: 'running' | 'done' | 'error' }
  | { type: 'source'; source: SourceReference }
  | { type: 'data_snapshot'; snapshot: DataSnapshot }
  | { type: 'answer_start' }
  | { type: 'answer_chunk'; content: string }
  | { type: 'answer_end' }
  | { type: 'verification'; result: VerificationResult }
  | { type: 'done'; total_tokens: number; duration_ms: number }
  | { type: 'error'; message: string };
