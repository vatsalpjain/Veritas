'use client';

import type { RebalanceRecommendation, RebalanceAction, StrategyAdvisorRecommendation } from '@/lib/types/portfolio';

interface Props {
  recommendations: RebalanceRecommendation[];
  advisor: StrategyAdvisorRecommendation;
}

const actionConfig: Record<RebalanceAction, { icon: string; iconColor: string; iconBg: string; amountPrefix: string; amountColor: string }> = {
  SELL:    { icon: 'arrow_downward', iconColor: '#ba1a1a', iconBg: '#ffdad6', amountPrefix: 'Sell $',    amountColor: '#ba1a1a' },
  BUY:     { icon: 'arrow_upward',   iconColor: '#009668', iconBg: '#d7f4e8', amountPrefix: 'Buy $',     amountColor: '#009668' },
  REALLOC: { icon: 'swap_horiz',     iconColor: '#006591', iconBg: '#eff4ff', amountPrefix: 'Re-alloc $', amountColor: '#006591' },
};

export default function RebalancingSection({ recommendations, advisor }: Props) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Rebalancing Recommendations (2 cols) */}
      <div className="lg:col-span-2 space-y-5">
        <h3
          className="text-xl font-extrabold tracking-tight"
          style={{ color: '#0f172a', fontFamily: 'Manrope, sans-serif' }}
        >
          Rebalancing Recommendations
        </h3>

        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: '#ffffff', boxShadow: '0 24px 40px rgba(11,28,48,0.05)' }}
        >
          {recommendations.map((rec, i) => {
            const cfg = actionConfig[rec.action];
            const isLast = i === recommendations.length - 1;
            return (
              <div
                key={rec.id}
                className="flex items-center gap-5 px-8 py-6"
                style={{ borderBottom: !isLast ? '1px solid rgba(226,232,240,0.5)' : 'none' }}
              >
                {/* Action icon */}
                <div
                  className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: cfg.iconBg }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: '18px',
                      color: cfg.iconColor,
                      fontVariationSettings: "'FILL' 0, 'wght' 500",
                    }}
                  >
                    {cfg.icon}
                  </span>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: '#0f172a', fontFamily: 'Inter, sans-serif' }}
                  >
                    {rec.title}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}
                  >
                    {rec.subtitle}
                  </p>
                </div>

                {/* Amount + CTA */}
                <div className="text-right shrink-0">
                  <p
                    className="text-sm font-bold"
                    style={{ color: cfg.amountColor, fontFamily: 'Inter, sans-serif' }}
                  >
                    {cfg.amountPrefix}{rec.amount.toLocaleString()}
                  </p>
                  <button
                    className="text-[10px] font-bold uppercase tracking-widest mt-1 transition-opacity hover:opacity-70"
                    style={{ color: '#006591', fontFamily: 'Inter, sans-serif' }}
                  >
                    {rec.ctaLabel}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Strategy Advisor */}
      <div className="space-y-5">
        <h3
          className="text-xl font-extrabold tracking-tight"
          style={{ color: '#0f172a', fontFamily: 'Manrope, sans-serif' }}
        >
          Strategy Advisor
        </h3>

        <div
          className="rounded-xl p-8 flex flex-col gap-6"
          style={{ backgroundColor: '#ffffff', boxShadow: '0 24px 40px rgba(11,28,48,0.05)' }}
        >
          <div>
            <p
              className="text-[10px] uppercase tracking-widest font-bold mb-2"
              style={{ color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}
            >
              Recommended For You
            </p>
            <h4
              className="text-xl font-extrabold"
              style={{ color: '#0f172a', fontFamily: 'Manrope, sans-serif' }}
            >
              {advisor.label}
            </h4>
            <p
              className="text-sm mt-2 leading-relaxed"
              style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}
            >
              {advisor.rationale}
            </p>
          </div>

          {/* Stats grid */}
          <div className="space-y-3">
            {[
              { label: 'Expected Return', value: `+${advisor.expectedReturnPA}% p.a.`, valueColor: '#009668' },
              { label: 'Risk Level',      value: advisor.riskLevel,                    valueColor: '#ba1a1a' },
              { label: 'Horizon',         value: advisor.horizonYears,                 valueColor: '#0f172a' },
            ].map(row => (
              <div
                key={row.label}
                className="flex justify-between items-center py-2"
                style={{ borderBottom: '1px solid rgba(226,232,240,0.5)' }}
              >
                <span
                  className="text-xs font-medium"
                  style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}
                >
                  {row.label}
                </span>
                <span
                  className="text-xs font-bold"
                  style={{ color: row.valueColor, fontFamily: 'Inter, sans-serif' }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          <button
            className="w-full py-3 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#0f172a', fontFamily: 'Inter, sans-serif' }}
          >
            Apply Strategy
          </button>
        </div>
      </div>
    </section>
  );
}
