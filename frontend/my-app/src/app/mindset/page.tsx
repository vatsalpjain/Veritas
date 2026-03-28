'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getMindsetPersonas, streamMindsetChat } from '@/lib/api/mindset';
import type { InvestorPersona, MindsetChatMessage } from '@/lib/types/mindset';
import PersonaCard from './components/PersonaCard';
import PersonaDetailModal from './components/PersonaDetailModal';
import MindsetComposer from './components/MindsetComposer';
import MindsetMessageBubble from './components/MindsetMessageBubble';


export default function MindsetPage() {
  const [personas, setPersonas] = useState<InvestorPersona[]>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('');

  const [messages, setMessages] = useState<MindsetChatMessage[]>([]);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [streamingAnswer, setStreamingAnswer] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [modalPersona, setModalPersona] = useState<InvestorPersona | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let active = true;

    getMindsetPersonas()
      .then((rows) => {
        if (!active) return;
        setPersonas(rows);
        if (rows.length > 0) {
          setSelectedPersonaId(rows[0].id);
        }
      })
      .catch(() => {
        if (!active) return;
        setPersonas([]);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, streamingAnswer]);

  const selectedPersona = useMemo(
    () => personas.find((p) => p.id === selectedPersonaId) ?? null,
    [personas, selectedPersonaId],
  );

  function handlePersonaSelect(personaId: string) {
    setSelectedPersonaId(personaId);
    const selected = personas.find((p) => p.id === personaId) ?? null;
    setModalPersona(selected);
    setIsPersonaModalOpen(!!selected);
  }

  async function handleSend(query: string) {
    if (!selectedPersona || isStreaming) return;

    const recentHistory = messages
      .slice(-6)
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');

    const extraContext = [
      `Current persona: ${selectedPersona.name} (${selectedPersona.era})`,
      `Persona time horizon: ${selectedPersona.time_horizon}`,
      recentHistory ? `Recent conversation history:\n${recentHistory}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    const userMessage: MindsetChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setThinkingSteps([]);
    setStreamingAnswer('');
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    let answerBuffer = '';

    try {
      await streamMindsetChat(query, selectedPersona.id, {
        onThinking: (step) => {
          setThinkingSteps((prev) => [...prev, step]);
        },
        onAnswerStart: () => {
          setStreamingAnswer('');
        },
        onAnswerChunk: (content) => {
          answerBuffer += content;
          setStreamingAnswer(answerBuffer);
        },
        onAnswerEnd: () => {
          const assistantMessage: MindsetChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: answerBuffer,
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
          setStreamingAnswer('');
        },
        onDone: () => {
          setIsStreaming(false);
        },
        onError: (message) => {
          const assistantError: MindsetChatMessage = {
            id: `assistant-error-${Date.now()}`,
            role: 'assistant',
            content: `Error: ${message}`,
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, assistantError]);
          setIsStreaming(false);
        },
      }, controller.signal, extraContext);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setIsStreaming(false);
        return;
      }
      setIsStreaming(false);
    }
  }



  return (
    <div
      className="flex flex-col gap-0 bg-white border rounded-2xl overflow-y-auto"
      style={{
        height: 'calc(100vh - 122px)',
        borderColor: 'rgba(203,213,225,0.45)',
      }}
    >
      {/* TOP 30% - Persona Selection Section */}
      <section
        className="shrink-0 border-b overflow-hidden"
        style={{
          minHeight: '390px',
          borderColor: 'rgba(203,213,225,0.4)',
          background: 'linear-gradient(135deg, #f8fbff 0%, #eef6ff 50%, #f7fbff 100%)',
        }}
      >
        <div className="px-6 pt-3 pb-4 md:px-8 md:pt-4 md:pb-5">
          <div>
            <h1
              className="text-3xl md:text-4xl font-black tracking-tight leading-none"
              style={{ color: '#0f172a', fontFamily: 'Manrope, sans-serif' }}
            >
              Pick Your Mindset
            </h1>
            <p className="text-sm md:text-base mt-2 opacity-80" style={{ color: '#334155', fontFamily: 'Inter, sans-serif' }}>
              Select an investor&apos;s mental model to guide your analysis
            </p>
          </div>

          {/* Fixed 5-card grid (no horizontal scroll) */}
          <div
            className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-stretch"
          >
            {personas.slice(0, 5).map((persona) => (
              <div key={persona.id} className="min-w-0">
                <PersonaCard
                  persona={persona}
                  selected={persona.id === selectedPersonaId}
                  onSelect={handlePersonaSelect}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM 70% - Chat Section */}
      <section className="flex flex-col min-h-105">
        {/* Messages Area */}
        <div
          ref={listRef}
          className="relative flex-1 overflow-y-auto px-6 md:px-8 py-4 min-h-55"
          style={{
            background: '#ffffff',
            scrollBehavior: 'smooth',
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            style={{ zIndex: 0 }}
            aria-hidden="true"
          >
            <span
              className="select-none font-semibold"
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: 'clamp(18px, 2.5vw, 28px)',
                color: 'rgba(71, 85, 105, 0.55)',
              }}
            >
              {selectedPersona ? `${selectedPersona.name} Mindset` : 'Veritas Mindset'}
            </span>
          </div>

          {messages.length === 0 && !isStreaming ? (
            <div className="relative z-10 h-24" />
          ) : (
            <div className="relative z-10 space-y-4 max-w-6xl mx-auto">
              {messages.map((msg) => (
                <MindsetMessageBubble
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                />
              ))}
              {isStreaming && streamingAnswer && (
                <MindsetMessageBubble
                  role="assistant"
                  content={streamingAnswer}
                  isStreaming={true}
                />
              )}
            </div>
          )}
        </div>

        {/* Composer Area - Sticky at Bottom */}
        <div
          className="shrink-0 border-t px-6 md:px-8 py-3 md:py-4"
          style={{
            backgroundColor: '#ffffff',
            borderColor: 'rgba(203,213,225,0.4)',
          }}
        >
          <div className="max-w-6xl mx-auto">
            <MindsetComposer
              disabled={!selectedPersona || isStreaming}
              selectedPersonaName={selectedPersona?.name || ''}
              onSend={handleSend}
            />
          </div>
        </div>
      </section>

      <PersonaDetailModal
        open={isPersonaModalOpen}
        persona={modalPersona}
        onClose={() => setIsPersonaModalOpen(false)}
      />
    </div>
  );
}
