'use client';

import type { NewsArticle, NewsSentiment, NewsCategory } from '@/lib/types/overview';

interface Props {
  data: NewsArticle[];
}

// ── Tag colour mapping (matches backend tag_class values) ─────────────────────
const TAG_STYLES: Record<string, { bg: string; color: string }> = {
  'tag-blue':  { bg: '#dce9ff', color: '#0043a4' },
  'tag-green': { bg: '#c8f5e2', color: '#005236' },
  'tag-amber': { bg: '#fff3cd', color: '#7d4e00' },
  'tag-red':   { bg: '#ffdad6', color: '#8c0009' },
  'tag-gray':  { bg: '#e5eeff', color: '#45464d' },
};

const SENTIMENT_ICON: Record<NewsSentiment, { icon: string; color: string }> = {
  bullish: { icon: 'trending_up',   color: '#009668' },
  bearish: { icon: 'trending_down', color: '#ba1a1a' },
  neutral: { icon: 'remove',        color: '#94a3b8' },
};

const CATEGORY_ICON: Record<NewsCategory, string> = {
  macro:     'account_balance',
  equity:    'bar_chart',
  crypto:    'currency_bitcoin',
  commodity: 'local_gas_station',
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NewsSection({ data }: Props) {
  // First card is featured (dark, full column), rest are compact cards
  const safeData = data && data.length > 0 ? data : [];
  if (safeData.length === 0) return null;
  const [featured, ...rest] = safeData;

  return (
    <section className="space-y-6">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h3
          className="text-lg font-bold flex items-center gap-2"
          style={{ color: '#000000', fontFamily: 'Manrope, sans-serif' }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '20px', color: '#006591', fontVariationSettings: "'FILL' 0, 'wght' 400" }}
          >
            breaking_news
          </span>
          Market News
        </h3>
        <a
          href="#"
          className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full transition-colors"
          style={{
            color: '#006591',
            backgroundColor: '#e5eeff',
            fontFamily: 'Inter, sans-serif',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#d3e0ff'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#e5eeff'; }}
        >
          View All News →
        </a>
      </div>

      {/* Bento grid — same 3-col layout as before */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Featured card (dark, col 1) */}
        <FeaturedCard article={featured} />

        {/* Remaining cards */}
        {rest.slice(0, 5).map((article, i) => (
          <CompactCard key={article.id ?? i} article={article} />
        ))}
      </div>
    </section>
  );
}

// ── Featured Card (dark background, matches old ReportCard style) ─────────────
function FeaturedCard({ article }: { article: NewsArticle }) {
  const tagStyle = TAG_STYLES[article.tag_class] ?? TAG_STYLES['tag-gray'];
  const sentimentInfo = SENTIMENT_ICON[article.sentiment] ?? SENTIMENT_ICON.neutral;
  const categoryIcon = CATEGORY_ICON[article.category] ?? 'article';

  return (
    <a
      href={article.url !== '#' ? article.url : undefined}
      target="_blank"
      rel="noopener noreferrer"
      className="group p-6 rounded-xl relative overflow-hidden flex flex-col no-underline"
      style={{ backgroundColor: '#131b2e', boxShadow: '0 24px 40px rgba(11,28,48,0.05)', textDecoration: 'none' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none transition-all duration-700 group-hover:opacity-150"
        style={{ backgroundColor: 'rgba(57,184,253,0.12)', marginRight: '-4rem', marginTop: '-4rem' }}
      />

      {/* Category icon */}
      <span
        className="material-symbols-outlined mb-4"
        style={{ fontSize: '24px', color: '#39b8fd', fontVariationSettings: "'FILL' 0, 'wght' 300" }}
      >
        {categoryIcon}
      </span>

      {/* Tag + sentiment */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide"
          style={{ backgroundColor: tagStyle.bg, color: tagStyle.color, fontFamily: 'Inter, sans-serif' }}
        >
          {article.tag}
        </span>
        <span
          className="material-symbols-outlined"
          style={{ fontSize: '16px', color: sentimentInfo.color, fontVariationSettings: "'FILL' 0, 'wght' 400" }}
        >
          {sentimentInfo.icon}
        </span>
      </div>

      {/* Headline */}
      <h4
        className="text-lg font-bold leading-snug mb-2 flex-1"
        style={{ color: '#ffffff', fontFamily: 'Manrope, sans-serif' }}
      >
        {article.headline}
      </h4>

      {/* Summary */}
      <p
        className="text-sm mb-5 line-clamp-3"
        style={{ color: '#7c839b', fontFamily: 'Inter, sans-serif' }}
      >
        {article.summary}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto">
        <span
          className="text-[11px] font-medium"
          style={{ color: '#475569', fontFamily: 'Inter, sans-serif' }}
        >
          {article.source_name}
        </span>
        <span
          className="text-[11px]"
          style={{ color: '#475569', fontFamily: 'Inter, sans-serif' }}
        >
          {relativeTime(article.published_at)}
        </span>
      </div>

      {/* Read more */}
      {article.url && article.url !== '#' && (
        <div
          className="flex items-center gap-1 mt-4 text-[11px] font-bold uppercase tracking-wider transition-opacity group-hover:opacity-100 opacity-70"
          style={{ color: '#39b8fd', fontFamily: 'Inter, sans-serif' }}
        >
          Read Full Story
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '14px', fontVariationSettings: "'FILL' 0, 'wght' 400" }}
          >
            arrow_forward
          </span>
        </div>
      )}
    </a>
  );
}

// ── Compact Card (light, matches old SignalCard / RiskCard style) ─────────────
function CompactCard({ article }: { article: NewsArticle }) {
  const tagStyle = TAG_STYLES[article.tag_class] ?? TAG_STYLES['tag-gray'];
  const sentimentInfo = SENTIMENT_ICON[article.sentiment] ?? SENTIMENT_ICON.neutral;

  return (
    <a
      href={article.url !== '#' ? article.url : undefined}
      target="_blank"
      rel="noopener noreferrer"
      className="group p-6 rounded-xl flex flex-col no-underline transition-shadow"
      style={{
        backgroundColor: '#ffffff',
        boxShadow: '0 24px 40px rgba(11,28,48,0.05)',
        border: '1px solid rgba(198,198,205,0.12)',
        textDecoration: 'none',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 24px 48px rgba(11,28,48,0.10)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 24px 40px rgba(11,28,48,0.05)'; }}
    >
      {/* Tag + sentiment */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide"
          style={{ backgroundColor: tagStyle.bg, color: tagStyle.color, fontFamily: 'Inter, sans-serif' }}
        >
          {article.tag}
        </span>
        <span
          className="material-symbols-outlined"
          style={{ fontSize: '18px', color: sentimentInfo.color, fontVariationSettings: "'FILL' 0, 'wght' 400" }}
        >
          {sentimentInfo.icon}
        </span>
      </div>

      {/* Headline */}
      <h4
        className="text-base font-bold leading-snug mb-2 flex-1 line-clamp-2"
        style={{ color: '#000000', fontFamily: 'Manrope, sans-serif' }}
      >
        {article.headline}
      </h4>

      {/* Summary */}
      <p
        className="text-sm mb-4 line-clamp-2"
        style={{ color: '#45464d', fontFamily: 'Inter, sans-serif' }}
      >
        {article.summary}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto">
        <span
          className="text-[11px] font-medium"
          style={{ color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}
        >
          {article.source_name}
        </span>
        <span
          className="text-[11px]"
          style={{ color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}
        >
          {relativeTime(article.published_at)}
        </span>
      </div>

      {/* Related tickers */}
      {article.related_tickers.length > 0 && (
        <div className="flex gap-1 mt-3 flex-wrap">
          {article.related_tickers.slice(0, 3).map(t => (
            <span
              key={t}
              className="text-[9px] font-bold px-1.5 py-0.5 rounded"
              style={{ backgroundColor: '#eff4ff', color: '#006591', fontFamily: 'Inter, sans-serif' }}
            >
              {t.replace('.NS', '')}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}
