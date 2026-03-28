'use client';

import { useState } from 'react';
import type { ChartAsset, ChartPeriod } from '@/lib/types/market';

interface Props {
  data: ChartAsset;
}

const PERIODS: ChartPeriod[] = ['1D', '1W', '1M', '1Y'];

export default function CandleChart({ data }: Props) {
  const [period, setPeriod] = useState<ChartPeriod>('1M');
  const candles = data.candles[period];

  const closes = candles.map(c => c.close);
  const highs  = candles.map(c => c.high);
  const lows   = candles.map(c => c.low);
  const opens  = candles.map(c => c.open);

  const maxPrice = Math.max(...highs);
  const minPrice = Math.min(...lows);
  const priceRange = maxPrice - minPrice || 1;

  const W = 1000;
  const H = 300;
  const candleW = Math.max(4, Math.floor(W / candles.length) - 3);
  const PAD = 24;

  const toY = (p: number) => H - PAD - ((p - minPrice) / priceRange) * (H - PAD * 2);

  // RSI line (mock oscillator based on close momentum)
  const rsiPoints = closes.map((c, i) => {
    const x = (i / (closes.length - 1)) * W;
    const norm = 0.3 + 0.4 * (Math.sin(i * 0.4) * 0.5 + 0.5);
    return `${x},${40 - norm * 32}`;
  }).join(' L');

  return (
    <div
      className="p-8 rounded-xl"
      style={{ backgroundColor: '#ffffff', boxShadow: '0 24px 40px -15px rgba(11,28,48,0.04)' }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h3
            className="text-2xl font-extrabold tracking-tighter mb-1"
            style={{ color: '#0f172a', fontFamily: 'Manrope, sans-serif' }}
          >
            {data.symbol}: QQQ
          </h3>
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-bold tracking-wider uppercase"
              style={{ color: '#7c839b', fontFamily: 'Inter, sans-serif' }}
            >
              {data.name}
            </span>
            <span
              className="text-[10px] px-2 py-0.5 rounded font-black tracking-tighter"
              style={{ backgroundColor: '#c9e6ff', color: '#004666', fontFamily: 'Inter, sans-serif' }}
            >
              VOLATILITY: {data.volatility}%
            </span>
          </div>
        </div>

        {/* Period tabs */}
        <div className="flex gap-2">
          {PERIODS.map(p => {
            const isActive = p === period;
            return (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="px-3 py-1 text-xs font-bold rounded transition-all"
                style={{
                  backgroundColor: isActive ? '#000000' : 'transparent',
                  color: isActive ? '#ffffff' : '#64748b',
                  border: isActive ? 'none' : '1px solid #c6c6cd',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart canvas */}
      <div
        className="relative rounded-lg overflow-hidden"
        style={{ height: '400px', backgroundColor: 'rgba(239,244,255,0.3)' }}
      >
        <svg
          className="w-full"
          style={{ height: '320px' }}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map(frac => (
            <line
              key={frac}
              x1="0" y1={H * frac} x2={W} y2={H * frac}
              stroke="rgba(198,198,205,0.3)" strokeWidth="1"
            />
          ))}

          {/* Candles */}
          {candles.map((c, i) => {
            const x = (i / candles.length) * W + (W / candles.length - candleW) / 2;
            const isGreen = c.close >= c.open;
            const color = isGreen ? '#4edea3' : '#ba1a1a';
            const bodyTop    = toY(Math.max(c.open, c.close));
            const bodyBottom = toY(Math.min(c.open, c.close));
            const bodyH = Math.max(1, bodyBottom - bodyTop);
            const wickX = x + candleW / 2;

            return (
              <g key={i}>
                {/* Wick */}
                <line
                  x1={wickX} y1={toY(c.high)}
                  x2={wickX} y2={toY(c.low)}
                  stroke={color} strokeWidth="1" opacity="0.7"
                />
                {/* Body */}
                <rect
                  x={x} y={bodyTop}
                  width={candleW} height={bodyH}
                  fill={color}
                  opacity={isGreen ? 1 : 0.8}
                  rx="1"
                />
              </g>
            );
          })}
        </svg>

        {/* RSI overlay strip */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center px-4"
          style={{
            height: '80px',
            borderTop: '1px dashed rgba(198,198,205,0.5)',
          }}
        >
          <span
            className="text-[10px] font-black tracking-widest absolute left-4"
            style={{ color: '#7c839b', fontFamily: 'Inter, sans-serif' }}
          >
            RSI (14): {data.rsi}
          </span>
          <svg className="w-full opacity-30" style={{ height: '48px' }} viewBox={`0 0 1000 40`} preserveAspectRatio="none">
            <path d={`M${rsiPoints}`} fill="none" stroke="#006591" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}
