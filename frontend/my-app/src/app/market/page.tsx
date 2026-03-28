import { getMarketData } from '@/lib/data/mockMarket';
import MarketIndexCards from './components/MarketIndexCards';
import CandleChart from './components/CandleChart';
import AlgorithmicSignals from './components/AlgorithmicSignals';
import SectorHeatmap from './components/SectorHeatmap';
import GrowthForecast from './components/GrowthForecast';
import AssetExplorer from './components/AssetExplorer';

// React Server Component.
// When backend is ready, replace getMarketData() in src/lib/data/mockMarket.ts
// with real parallel API calls:
//   - GET /yf/index/^GSPC, ^IXIC  →  index cards
//   - GET /yf/quote/BTC-USD, ETH-USD  →  crypto index cards
//   - GET /yf/history/QQQ?period=...  →  candle chart (all 4 periods)
//   - POST /yf/batch-quotes  →  asset explorer stocks tab
//   - GET /yf/quote/BTC-USD, ETH-USD, SOL-USD  →  crypto tab
// See src/lib/types/market.ts for full backend alignment notes.

export default async function MarketPage() {
  const data = await getMarketData();

  return (
    <>
      {/* ── Section 1: Global Market Index Cards ── */}
      <MarketIndexCards data={data.indices} />

      {/* ── Section 2: Main 8/4 Grid — Chart + Right sidebar ── */}
      <div className="grid grid-cols-12 gap-12">
        {/* Left: Chart + Sector Heatmap */}
        <div className="col-span-12 xl:col-span-8 space-y-8">
          <CandleChart data={data.chart} />
          <SectorHeatmap data={data.sectors} />
        </div>

        {/* Right: Algo Signals + Growth Forecast */}
        <div className="col-span-12 xl:col-span-4 space-y-12">
          <AlgorithmicSignals data={data.signals} />
          <GrowthForecast data={data.growthForecasts} />
        </div>
      </div>

      {/* ── Section 3: Asset Explorer ── */}
      <AssetExplorer data={data.assets} />
    </>
  );
}
