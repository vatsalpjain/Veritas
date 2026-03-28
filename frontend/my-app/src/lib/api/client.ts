// ─── Backend API Client ───────────────────────────────────────────────────────
// Base URL reads from env; falls back to localhost:8000 for local dev.
// All fetches use Next.js cache revalidation so data stays fresh.
// ─────────────────────────────────────────────────────────────────────────────

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// Revalidation windows (seconds)
export const REVALIDATE = {
  LIVE:    15,   // quotes, stats     → 15s
  HISTORY: 60,   // OHLCV history     → 60s
  SLOW:   300,   // insights, alerts  → 5 min
};

export class ApiError extends Error {
  constructor(
    public status: number,
    public endpoint: string,
    message: string,
  ) {
    super(`[${status}] ${endpoint}: ${message}`);
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit & { revalidate?: number },
): Promise<T> {
  const { revalidate = REVALIDATE.LIVE, ...fetchOptions } = options ?? {};
  const url = `${BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    ...fetchOptions,
    next: { revalidate },
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body?.error ?? body?.detail ?? message;
    } catch {
      // ignore parse error
    }
    throw new ApiError(res.status, endpoint, message);
  }

  return res.json() as Promise<T>;
}

export async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const b = await res.json();
      message = b?.error ?? b?.detail ?? message;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, endpoint, message);
  }

  return res.json() as Promise<T>;
}
