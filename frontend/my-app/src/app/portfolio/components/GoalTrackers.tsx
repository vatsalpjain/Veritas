'use client';

import type { GoalTracker } from '@/lib/types/portfolio';

interface Props {
  data: GoalTracker[];
}

function formatValue(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

export default function GoalTrackers({ data }: Props) {
  return (
    <section className="space-y-6">
      <h3
        className="text-xl font-extrabold tracking-tight"
        style={{ color: '#0f172a', fontFamily: 'Manrope, sans-serif' }}
      >
        Goal Trackers
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.map(goal => (
          <div
            key={goal.id}
            className="p-8 rounded-xl flex flex-col gap-5"
            style={{ backgroundColor: '#ffffff', boxShadow: '0 24px 40px rgba(11,28,48,0.05)' }}
          >
            {/* Icon + label */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: goal.iconBg }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: '20px',
                    color: goal.iconColor,
                    fontVariationSettings: "'FILL' 1, 'wght' 400",
                  }}
                >
                  {goal.icon}
                </span>
              </div>
              <span
                className="text-[10px] font-bold uppercase tracking-[0.15em]"
                style={{ color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}
              >
                {goal.label}
              </span>
            </div>

            {/* Value display */}
            <div>
              <div className="flex items-baseline gap-1.5">
                <span
                  className="text-2xl font-extrabold"
                  style={{ color: '#0f172a', fontFamily: 'Manrope, sans-serif' }}
                >
                  {formatValue(goal.currentValue)}
                </span>
                <span
                  className="text-sm font-medium"
                  style={{ color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}
                >
                  / {formatValue(goal.targetValue)}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div
                className="h-1.5 w-full rounded-full overflow-hidden"
                style={{ backgroundColor: '#f1f5f9' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(goal.progressPercent, 100)}%`,
                    backgroundColor: goal.progressBarColor,
                  }}
                />
              </div>

              {/* Progress % + status / CTA */}
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-medium"
                  style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}
                >
                  {goal.progressPercent}% complete
                </span>
                {goal.ctaLabel ? (
                  <button
                    className="text-xs font-bold transition-opacity hover:opacity-70"
                    style={{ color: '#006591', fontFamily: 'Inter, sans-serif' }}
                  >
                    {goal.ctaLabel}
                  </button>
                ) : (
                  <span
                    className="text-xs font-semibold"
                    style={{ color: goal.statusColor, fontFamily: 'Inter, sans-serif' }}
                  >
                    {goal.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
