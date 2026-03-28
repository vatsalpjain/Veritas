'use client';

import type { AlgoSignal, SignalStatus } from '@/lib/types/market';

interface Props {
  data: AlgoSignal[];
}

const statusStyle: Record<SignalStatus, { color: string }> = {
  CONFIRMED: { color: '#4edea3' },
  WARNING:   { color: '#ba1a1a' },
  NEUTRAL:   { color: '#39b8fd' },
};

const iconBgStyle: Record<SignalStatus, { bg: string; color: string }> = {
  CONFIRMED: { bg: 'rgba(78,222,163,0.2)',  color: '#4edea3' },
  WARNING:   { bg: 'rgba(186,26,26,0.2)',   color: '#ba1a1a' },
  NEUTRAL:   { bg: 'rgba(57,184,253,0.2)',  color: '#39b8fd' },
};

export default function AlgorithmicSignals({ data }: Props) {
  return (
    <section
      className="p-8 rounded-xl relative overflow-hidden"
      style={{ backgroundColor: '#131b2e' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: 'rgba(0,101,145,0.15)' }}
      />

      <h3
        className="font-black text-xl text-white mb-6 tracking-tighter"
        style={{ fontFamily: 'Manrope, sans-serif' }}
      >
        Algorithmic Signals
      </h3>

      <div className="space-y-4 relative z-10">
        {data.map(sig => {
          const iconStyle = iconBgStyle[sig.status];
          const statusColor = statusStyle[sig.status].color;
          return (
            <div
              key={sig.id}
              className="flex items-start gap-4 p-4 rounded-lg"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Icon */}
              <div
                className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center"
                style={{ backgroundColor: iconStyle.bg }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: '18px',
                    color: iconStyle.color,
                    fontVariationSettings: "'FILL' 1, 'wght' 400",
                  }}
                >
                  {sig.icon}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span
                    className="font-bold text-white text-sm"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {sig.ticker}: {sig.signalType}
                  </span>
                  <span
                    className="text-[10px] font-black uppercase"
                    style={{ color: statusColor, fontFamily: 'Inter, sans-serif' }}
                  >
                    {sig.status}
                  </span>
                </div>
                <p
                  className="text-[11px] leading-relaxed"
                  style={{ color: 'rgba(124,131,155,0.9)', fontFamily: 'Inter, sans-serif' }}
                >
                  {sig.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
