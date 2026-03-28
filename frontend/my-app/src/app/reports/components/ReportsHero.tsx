'use client';

import { useState } from 'react';

export default function ReportsHero() {
  const [activePeriod, setActivePeriod] = useState('1M');
  const periods = ['1M', '3M', '6M', '1Y', 'All'];

  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[11px] uppercase tracking-[.1em] font-bold text-slate-500 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
          Portfolio Intelligence
        </p>
        <h2 className="text-4xl font-extrabold text-black tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Investment Reports
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Full ledger · Alexander Thorne · Generated {today}
        </p>
      </div>

      {/* Report Period Selector */}
      <div className="flex gap-2">
        {periods.map((period) => (
          <button
            key={period}
            onClick={() => setActivePeriod(period)}
            className="px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all"
            style={{
              backgroundColor: activePeriod === period ? '#000000' : '#eff4ff',
              color: activePeriod === period ? '#ffffff' : '#76777d',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {period}
          </button>
        ))}
      </div>
    </div>
  );
}
