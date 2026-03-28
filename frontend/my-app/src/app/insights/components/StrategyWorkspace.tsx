'use client';

import type { DataSnapshot, IterationOutput } from '@/lib/types/agent';
import { getTheme } from '../theme';

interface Props {
  activeIntent: string;
  dataSnapshots: DataSnapshot[];
  iterationOutputs: IterationOutput[];
}

interface AllocationItem {
  label: string;
  currentPercent: number;
  targetPercent: number;
  status: string;
}

export default function StrategyWorkspace({ activeIntent, dataSnapshots, iterationOutputs }: Props) {
  if (activeIntent !== 'strategy') return null;

  const theme = getTheme(activeIntent);
  const summary = dataSnapshots.find((s) => s.type === 'portfolio_summary')?.data || {};
  const allocationData = dataSnapshots.find((s) => s.label === 'Allocation Mix')?.data || {};
  const riskProfile = dataSnapshots.find((s) => s.label === 'Risk Profile')?.data || {};
  const allocations = (allocationData.allocations as AllocationItem[] | undefined) || [];

  if (!summary || Object.keys(summary).length === 0) return null;

  const latestStrategyOutput = [...iterationOutputs]
    .reverse()
    .find((o) => o.intent === 'strategy' && o.layer === 'execution');

  const score = Number(riskProfile.score ?? 0);
  const grade = String(riskProfile.grade ?? 'N/A');

  return (
    <div>
      <SectionLabel icon="dashboard" label="Strategy Workspace" />
      <div className="space-y-3">
        <div className="p-3 rounded-lg" style={{ backgroundColor: '#ffffff', border: `1px solid ${theme.softBorder}` }}>
          <p className="text-[12px] font-extrabold mb-2" style={{ color: theme.accent, fontFamily: 'Manrope, sans-serif' }}>
            Portfolio Pulse
          </p>
          <div className="grid grid-cols-3 gap-2">
            <Metric label="Value" value={formatLargeNumber(Number(summary.total_value ?? 0))} />
            <Metric
              label="PnL"
              value={`${Number(summary.total_pnl_percent ?? 0) >= 0 ? '+' : ''}${Number(summary.total_pnl_percent ?? 0).toFixed(1)}%`}
              valueColor={Number(summary.total_pnl_percent ?? 0) >= 0 ? '#009668' : '#ba1a1a'}
            />
            <Metric label="Cash" value={formatLargeNumber(Number(summary.cash ?? 0))} />
          </div>
        </div>

        {allocations.length > 0 && (
          <div className="p-3 rounded-lg" style={{ backgroundColor: '#ffffff', border: `1px solid ${theme.softBorder}` }}>
            <p className="text-[12px] font-extrabold mb-2" style={{ color: '#0f172a', fontFamily: 'Manrope, sans-serif' }}>
              Allocation vs Target
            </p>
            <div className="space-y-2">
              {allocations.slice(0, 5).map((item) => {
                const current = Number(item.currentPercent || 0);
                const target = Number(item.targetPercent || 0);
                const diff = current - target;
                const diffColor = diff > 0 ? '#c9a84c' : diff < 0 ? '#7c3aed' : '#009668';

                return (
                  <div key={item.label} className="rounded-md p-2" style={{ backgroundColor: '#f8f9ff' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold" style={{ color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
                        {item.label}
                      </span>
                      <span className="text-[10px]" style={{ color: diffColor, fontFamily: 'Inter, sans-serif' }}>
                        {diff >= 0 ? '+' : ''}{diff.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full relative" style={{ backgroundColor: '#e2e8f0' }}>
                      <div className="h-2 rounded-full" style={{ width: `${Math.max(2, current)}%`, backgroundColor: theme.accent }} />
                      <div
                        className="absolute -top-0.5 w-1 h-3 rounded"
                        style={{ left: `${Math.min(98, Math.max(1, target))}%`, backgroundColor: '#131b2e' }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px]" style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}>Current {current.toFixed(0)}%</span>
                      <span className="text-[10px]" style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}>Target {target.toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="p-3 rounded-lg" style={{ backgroundColor: '#ffffff', border: `1px solid ${theme.softBorder}` }}>
          <p className="text-[12px] font-extrabold mb-2" style={{ color: '#0f172a', fontFamily: 'Manrope, sans-serif' }}>
            Risk Gauge
          </p>
          <div className="flex items-center gap-3">
            <Gauge score={score} accent={theme.accent} />
            <div>
              <p className="text-[12px] font-extrabold" style={{ color: theme.accent, fontFamily: 'Manrope, sans-serif' }}>
                {grade} ({score})
              </p>
              <p className="text-[11px]" style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}>
                Strategy: {String(riskProfile.strategyName ?? 'N/A')}
              </p>
              <p className="text-[11px]" style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}>
                Sectors {String(riskProfile.sectorCount ?? 'N/A')} • Asset classes {String(riskProfile.assetClassCount ?? 'N/A')}
              </p>
            </div>
          </div>
        </div>

        {latestStrategyOutput?.tool_summaries && latestStrategyOutput.tool_summaries.length > 0 && (
          <div className="p-3 rounded-lg" style={{ backgroundColor: '#ffffff', border: `1px solid ${theme.softBorder}` }}>
            <p className="text-[12px] font-extrabold mb-2" style={{ color: '#0f172a', fontFamily: 'Manrope, sans-serif' }}>
              Rebalance Signals
            </p>
            <div className="space-y-1.5">
              {latestStrategyOutput.tool_summaries.slice(0, 4).map((summary, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: '13px', color: theme.accent }}>
                    bolt
                  </span>
                  <p className="text-[11px]" style={{ color: '#334155', fontFamily: 'Inter, sans-serif' }}>
                    {summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="rounded-md p-2" style={{ backgroundColor: '#f8f9ff' }}>
      <p className="text-[10px] uppercase tracking-wider" style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}>{label}</p>
      <p className="text-[13px] font-extrabold" style={{ color: valueColor ?? '#0f172a', fontFamily: 'Manrope, sans-serif' }}>{value}</p>
    </div>
  );
}

function Gauge({ score, accent }: { score: number; accent: string }) {
  const normalized = Math.min(100, Math.max(0, score));
  const dash = 220;
  const progress = (normalized / 100) * dash;

  return (
    <svg width="92" height="64" viewBox="0 0 120 80">
      <path d="M10 70 A50 50 0 0 1 110 70" fill="none" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" />
      <path
        d="M10 70 A50 50 0 0 1 110 70"
        fill="none"
        stroke={accent}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${progress} ${dash - progress}`}
      />
      <text x="60" y="54" textAnchor="middle" style={{ fontFamily: 'Manrope, sans-serif', fontSize: '16px', fontWeight: 800, fill: '#0f172a' }}>
        {normalized}
      </text>
    </svg>
  );
}

function SectionLabel({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#64748b' }}>
        {icon}
      </span>
      <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}>
        {label}
      </span>
    </div>
  );
}

function formatLargeNumber(n: number): string {
  if (!Number.isFinite(n)) return 'N/A';
  const abs = Math.abs(n);
  if (abs >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toFixed(0);
}
