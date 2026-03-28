'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import type { InvestorPersona } from '@/lib/types/mindset';

interface Props {
  persona: InvestorPersona;
  selected: boolean;
  onSelect: (personaId: string) => void;
}

export default function PersonaCard({ persona, selected, onSelect }: Props) {
  const imageUrl = useMemo(() => {
    const mappedById: Record<string, string> = {
      warren_buffett: '/personas/warren_buffet.png',
      ray_dalio: '/personas/ray_dalio.png',
      peter_lynch: '/personas/peter_lynch.png',
      charlie_munger: '/personas/charlie_munger.png',
      cathie_wood: '/personas/cathie_wood.png',
    };

    return persona.image_url?.trim() || mappedById[persona.id] || `/personas/${persona.id}.png`;
  }, [persona.id, persona.image_url]);

  const [hasValidImage, setHasValidImage] = useState(true);

  return (
    <button
      onClick={() => onSelect(persona.id)}
      className="text-left rounded-3xl overflow-hidden border transition-all duration-300 hover:scale-[1.02] active:scale-100 flex flex-col h-full min-h-60 w-full"
      style={{
        backgroundColor: '#ffffff',
        borderColor: selected ? '#006591' : 'rgba(203,213,225,0.8)',
        boxShadow: selected
          ? '0 0 32px rgba(0,101,145,0.35), 0 0 64px rgba(0,101,145,0.15), inset 0 0 16px rgba(57,184,253,0.1)'
          : '0 12px 28px rgba(11,28,48,0.06)',
        transform: selected ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {/* Image Container */}
      <div className="relative h-32 overflow-hidden bg-linear-to-br from-slate-100 to-slate-50">
        {hasValidImage ? (
          <Image
            src={imageUrl}
            alt={persona.name}
            fill
            className="object-cover"
            onError={() => setHasValidImage(false)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span
              className="text-6xl font-black opacity-20"
              style={{ color: '#0f172a', fontFamily: 'Manrope, sans-serif' }}
            >
              {persona.name.charAt(0)}
            </span>
          </div>
        )}
        {/* Glow overlay when selected */}
        {selected && (
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(0,101,145,0.2) 0%, rgba(57,184,253,0.1) 100%)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
        )}
      </div>

      {/* Content Container */}
      <div className="p-4 flex-1 flex flex-col"
        style={{
          background: selected 
            ? 'linear-gradient(180deg, #edf7ff 0%, #f0faff 100%)'
            : '#ffffff'
        }}
      >
        <div>
          <h3 className="text-[15px] font-extrabold leading-tight" style={{ color: '#0f172a', fontFamily: 'Manrope, sans-serif' }}>
            {persona.name}
          </h3>
          <p className="text-[10px] mt-0.5 leading-snug opacity-75 line-clamp-1" style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}>
            {persona.title}
          </p>
        </div>

        <div className="mt-2 flex items-start justify-between gap-2">
          <p className="text-[11px] leading-relaxed flex-1 line-clamp-2" style={{ color: '#334155', fontFamily: 'Inter, sans-serif' }}>
            {persona.core_style}
          </p>
          <span
            className="text-[9px] font-bold px-1.5 py-1 rounded-full whitespace-nowrap"
            style={{
              backgroundColor: selected ? '#006591' : '#f1f5f9',
              color: selected ? '#ffffff' : '#475569',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {persona.risk_profile}
          </span>
        </div>

        {/* Stock Focus */}
        <div className="mt-1.5 flex flex-wrap gap-1">
          {persona.stocks_focus.slice(0, 3).map((symbol) => (
            <span
              key={symbol}
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
              style={{ backgroundColor: '#eff6ff', color: '#006591', fontFamily: 'Inter, sans-serif' }}
            >
              {symbol}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
