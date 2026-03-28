'use client';

import type { SourceReference, DataSnapshot, VerificationResult } from '@/lib/types/agent';
import SourceCard from './SourceCard';
import DataCard from './DataCard';
import VerificationBadge from './VerificationBadge';

interface Props {
  sources: SourceReference[];
  dataSnapshots: DataSnapshot[];
  verification: VerificationResult | null;
}

export default function ContextPanel({ sources, dataSnapshots, verification }: Props) {
  const isEmpty = sources.length === 0 && dataSnapshots.length === 0 && !verification;

  return (
    <div
      className="flex flex-col flex-1 min-h-0 rounded-xl overflow-hidden"
      style={{
        backgroundColor: '#f8f9ff',
        border: '1px solid rgba(198,198,205,0.15)',
        boxShadow: '0 8px 32px rgba(11,28,48,0.04)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-5 py-3"
        style={{ borderBottom: '1px solid rgba(226,232,240,0.5)' }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: '16px', color: '#006591', fontVariationSettings: "'FILL' 0, 'wght' 400" }}
        >
          hub
        </span>
        <span
          className="text-sm font-bold"
          style={{ color: '#0f172a', fontFamily: 'Manrope, sans-serif' }}
        >
          Research Context
        </span>
        {!isEmpty && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto"
            style={{ backgroundColor: '#e5eeff', color: '#006591', fontFamily: 'Inter, sans-serif' }}
          >
            {sources.length + dataSnapshots.length} items
          </span>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <span
              className="material-symbols-outlined mb-3"
              style={{ fontSize: '36px', color: '#cbd5e1', fontVariationSettings: "'FILL' 0, 'wght' 200" }}
            >
              hub
            </span>
            <p
              className="text-sm"
              style={{ color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}
            >
              Sources and data will appear here as Veritas researches your query.
            </p>
          </div>
        )}

        {/* Verification badge */}
        {verification && (
          <div>
            <SectionLabel icon="verified" label="Verification Result" />
            <VerificationBadge result={verification} />
          </div>
        )}

        {/* Data snapshots */}
        {dataSnapshots.length > 0 && (
          <div>
            <SectionLabel icon="monitoring" label={`Live Data (${dataSnapshots.length})`} />
            <div className="space-y-2">
              {dataSnapshots.map((snapshot, i) => (
                <DataCard key={i} snapshot={snapshot} />
              ))}
            </div>
          </div>
        )}

        {/* Sources */}
        {sources.length > 0 && (
          <div>
            <SectionLabel icon="link" label={`Sources (${sources.length})`} />
            <div className="space-y-2">
              {sources.map((source, i) => (
                <SourceCard key={i} source={source} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <span
        className="material-symbols-outlined"
        style={{ fontSize: '14px', color: '#64748b', fontVariationSettings: "'FILL' 0, 'wght' 400" }}
      >
        {icon}
      </span>
      <span
        className="text-[11px] font-bold uppercase tracking-wider"
        style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}
      >
        {label}
      </span>
    </div>
  );
}
