'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import type { InvestorPersona } from '@/lib/types/mindset';

interface Props {
  open: boolean;
  persona: InvestorPersona | null;
  onClose: () => void;
}

export default function PersonaDetailModal({ open, persona, onClose }: Props) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open || !persona) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(5px)',
          animation: 'mindsetBackdropIn 180ms ease-out',
        }}
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-5xl max-h-[88vh] overflow-y-auto rounded-3xl border"
        style={{
          background: 'linear-gradient(155deg, #ffffff 0%, #f7fbff 100%)',
          borderColor: 'rgba(148,163,184,0.35)',
          boxShadow: '0 28px 70px rgba(2, 8, 23, 0.35)',
          animation: 'mindsetModalIn 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full border flex items-center justify-center"
          style={{ borderColor: 'rgba(148,163,184,0.35)', backgroundColor: '#ffffff', color: '#334155' }}
          aria-label="Close persona details"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 md:p-8">
          <div className="lg:col-span-5">
            <div className="relative h-72 rounded-2xl overflow-hidden border" style={{ borderColor: 'rgba(148,163,184,0.25)' }}>
              <Image
                src={persona.image_url || `/personas/${persona.id}.png`}
                alt={persona.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="mt-4 rounded-2xl p-4" style={{ backgroundColor: '#eff6ff', border: '1px solid rgba(148,163,184,0.25)' }}>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#0369a1', fontFamily: 'Inter, sans-serif' }}>
                Estimated Net Worth
              </p>
              <p className="text-2xl font-black mt-1" style={{ color: '#0f172a', fontFamily: 'Manrope, sans-serif' }}>
                {persona.net_worth_estimate || 'N/A'}
              </p>
              <p className="text-xs mt-2" style={{ color: '#475569', fontFamily: 'Inter, sans-serif' }}>
                Risk profile: {persona.risk_profile} • Horizon: {persona.time_horizon}
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#0369a1', fontFamily: 'Inter, sans-serif' }}>
                {persona.era}
              </p>
              <h2 className="text-3xl font-black mt-1" style={{ color: '#0f172a', fontFamily: 'Manrope, sans-serif' }}>
                {persona.name}
              </h2>
              <p className="text-sm mt-1" style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}>
                {persona.title}
              </p>
            </div>

            <p className="text-base leading-relaxed" style={{ color: '#1e293b', fontFamily: 'Inter, sans-serif' }}>
              {persona.persona_summary}
            </p>

            <div className="rounded-2xl p-4" style={{ backgroundColor: '#f8fafc', border: '1px solid rgba(148,163,184,0.25)' }}>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#334155', fontFamily: 'Inter, sans-serif' }}>
                Famous Advice
              </p>
              <p className="text-lg italic mt-2" style={{ color: '#0f172a', fontFamily: 'Manrope, sans-serif' }}>
                &ldquo;{persona.famous_advice || 'Focus on discipline, process, and long-term thinking.'}&rdquo;
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#334155', fontFamily: 'Inter, sans-serif' }}>
                Signature Bets / Focus
              </p>
              <div className="flex flex-wrap gap-2">
                {(persona.signature_bets && persona.signature_bets.length > 0 ? persona.signature_bets : persona.stocks_focus).slice(0, 6).map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 rounded-full text-xs font-bold"
                    style={{ backgroundColor: '#e2e8f0', color: '#0f172a', fontFamily: 'Inter, sans-serif' }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#334155', fontFamily: 'Inter, sans-serif' }}>
                Notable Facts
              </p>
              <ul className="space-y-2">
                {(persona.notable_facts || persona.principles.slice(0, 3)).slice(0, 3).map((fact) => (
                  <li key={fact} className="text-sm leading-relaxed" style={{ color: '#1e293b', fontFamily: 'Inter, sans-serif' }}>
                    • {fact}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes mindsetBackdropIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes mindsetModalIn {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          [style*='mindsetBackdropIn'],
          [style*='mindsetModalIn'] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
