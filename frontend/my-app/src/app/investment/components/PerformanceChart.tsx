'use client';

import { useState } from 'react';
import type { PerformanceHistory, HistoryPeriod } from '@/lib/types/investment';

interface Props {
  data: Record<HistoryPeriod, PerformanceHistory>;
}

const PERIODS: HistoryPeriod[] = ['1M', '3M', '1Y', 'ALL'];

export default function PerformanceChart({ data }: Props) {
  const [activePeriod, setActivePeriod] = useState<HistoryPeriod>('1M');
  const history = data[activePeriod];

  // Normalize close prices into SVG coordinates (1000 x 256 viewBox)
  const closes = history.points.map(p => p.close);
  const minVal = Math.min(...closes);
  const maxVal = Math.max(...closes);
  const range = maxVal - minVal || 1;

  const svgPoints = closes.map((c, i) => {
    const x = (i / (closes.length - 1)) * 1000;
    const y = 256 - ((c - minVal) / range) * 220 - 18; // 18px top padding
    return `${x},${y}`;
  });

  const linePath = 'M' + svgPoints.join(' L');
  const areaPath = linePath + ` L1000,256 L0,256 Z`;

  // Bar heights for background decoration (normalized 0–100)
  const barHeights = [25, 40, 33, 60, 80, 67, 100];

  // Find peak index
  const peakIdx = closes.indexOf(maxVal);
  const peakX = (peakIdx / (closes.length - 1)) * 1000;
  const peakY = 256 - ((maxVal - minVal) / range) * 220 - 18;
  const fmtPeak = (history.peakValue / 1_000_000).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex justify-between items-end">
        <div>
          <h3
            className="text-xl font-extrabold tracking-tight"
            style={{ color: '#0f172a', fontFamily: 'Manrope, sans-serif' }}
          >
            Performance History
          </h3>
          <p
            className="text-sm mt-1"
            style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}
          >
            Portfolio growth over the selected period
          </p>
        </div>

        {/* Period tabs */}
        <div
          className="flex rounded-lg p-1"
          style={{ backgroundColor: '#e5eeff' }}
        >
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setActivePeriod(p)}
              className="px-4 py-1.5 text-xs font-bold rounded-md transition-all"
              style={{
                backgroundColor: activePeriod === p ? '#ffffff' : 'transparent',
                color: activePeriod === p ? '#0f172a' : '#64748b',
                boxShadow: activePeriod === p ? '0 1px 4px rgba(11,28,48,0.08)' : 'none',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div
        className="h-80 w-full rounded-xl p-8 relative overflow-hidden group"
        style={{ backgroundColor: '#ffffff', boxShadow: '24px 0 40px rgba(11,28,48,0.03)' }}
      >
        {/* Background bar decoration */}
        <div className="absolute inset-0 flex items-end px-4 gap-2 opacity-[0.06] pointer-events-none">
          {barHeights.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm"
              style={{ backgroundColor: '#000000', height: `${h}%` }}
            />
          ))}
        </div>

        {/* SVG chart */}
        <div className="relative z-10 w-full h-full border-l border-b" style={{ borderColor: '#f1f5f9' }}>
          <svg
            className="w-full h-64 overflow-visible"
            viewBox="0 0 1000 256"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="perfGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(57,184,253,0.22)" />
                <stop offset="100%" stopColor="rgba(57,184,253,0)" />
              </linearGradient>
            </defs>

            {/* Area fill */}
            <path d={areaPath} fill="url(#perfGradient)" />

            {/* Line */}
            <path d={linePath} fill="none" stroke="#006591" strokeWidth="3" strokeLinejoin="round" />

            {/* Peak dot */}
            <circle
              cx={peakX}
              cy={peakY}
              r="6"
              fill="#006591"
              className="group-hover:scale-125 transition-transform"
              style={{ transformOrigin: `${peakX}px ${peakY}px` }}
            />
          </svg>

          {/* Peak label */}
          <div
            className="absolute top-4 right-4 text-white text-[10px] font-bold px-2 py-1 rounded"
            style={{ backgroundColor: '#000000', fontFamily: 'Inter, sans-serif' }}
          >
            PEAK: ${fmtPeak}M
          </div>
        </div>
      </div>
    </div>
  );
}
