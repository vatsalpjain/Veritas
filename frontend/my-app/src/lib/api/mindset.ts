import { BASE_URL, apiFetch, REVALIDATE } from '@/lib/api/client';
import type { InvestorPersona, MindsetSSEEvent } from '@/lib/types/mindset';

interface PersonasResponse {
  personas: InvestorPersona[];
}

export interface MindsetSSECallbacks {
  onThinking: (step: string, status: 'running' | 'done' | 'error') => void;
  onAnswerStart: () => void;
  onAnswerChunk: (content: string) => void;
  onAnswerEnd: () => void;
  onDone: (info: { total_tokens: number; duration_ms: number }) => void;
  onError: (message: string) => void;
}

export async function getMindsetPersonas(): Promise<InvestorPersona[]> {
  const response = await apiFetch<PersonasResponse>('/mindset/personas', {
    revalidate: REVALIDATE.SLOW,
  });
  return response.personas;
}

export async function streamMindsetChat(
  query: string,
  personaId: string,
  callbacks: MindsetSSECallbacks,
  signal?: AbortSignal,
  extraContext?: string,
): Promise<void> {
  const response = await fetch(`${BASE_URL}/mindset/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, persona_id: personaId, extra_context: extraContext ?? null }),
    signal,
  });

  if (!response.ok) {
    callbacks.onError(`HTTP ${response.status}: ${response.statusText}`);
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    callbacks.onError('No response stream available');
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;

        const jsonStr = trimmed.slice(5).trim();
        if (!jsonStr || jsonStr === '[DONE]') continue;

        try {
          const event = JSON.parse(jsonStr) as MindsetSSEEvent;

          switch (event.type) {
            case 'thinking':
              callbacks.onThinking(event.step, event.status);
              break;
            case 'answer_start':
              callbacks.onAnswerStart();
              break;
            case 'answer_chunk':
              callbacks.onAnswerChunk(event.content);
              break;
            case 'answer_end':
              callbacks.onAnswerEnd();
              break;
            case 'done':
              callbacks.onDone(event);
              break;
            case 'error':
              callbacks.onError(event.message);
              break;
            default:
              break;
          }
        } catch {
          // Ignore malformed stream events.
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
