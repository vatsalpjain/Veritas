"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { X, TrendingUp, Cpu, Activity, Clock, Maximize2, Minimize2 } from "lucide-react";
import { createChart, ColorType, IChartApi, ISeriesApi } from "lightweight-charts";

interface FuturePredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  holdings: Array<{ ticker: string; name: string }>;
}

export default function FuturePredictionModal({
  isOpen,
  onClose,
  holdings,
}: FuturePredictionModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  const [activeTab, setActiveTab] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const [chartDataCache, setChartDataCache] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  const currentHolding = holdings[activeTab];

  // Fetch data
  useEffect(() => {
    if (!isOpen || !currentHolding) return;
    
    const fetchChartData = async () => {
      const ticker = currentHolding.ticker;
      if (chartDataCache[ticker]) return; // already cached
      
      setIsLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/investments/future-predictions/${ticker}`);
        const json = await res.json();
        setChartDataCache((prev) => ({ ...prev, [ticker]: json.data }));
      } catch (err) {
        console.error("Failed to fetch future predictions:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [isOpen, activeTab, currentHolding, chartDataCache]);

  useEffect(() => {
    let ctx = gsap.context(() => {});
    if (isOpen) {
      document.body.style.overflow = "hidden";
      ctx = gsap.context(() => {
        gsap.fromTo(
          modalRef.current,
          { opacity: 0, backdropFilter: "blur(0px)" },
          { opacity: 1, backdropFilter: "blur(20px)", duration: 0.6, ease: "power3.out" }
        );
        gsap.fromTo(
          contentRef.current,
          { scale: 0.9, opacity: 0, y: 50 },
          { scale: 1, opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: "back.out(1.2)" }
        );
      });
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      ctx.revert();
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Timeline animation
  useEffect(() => {
    if (isOpen && timelineRef.current) {
      const scrollWidth = timelineRef.current.scrollWidth;
      gsap.to(timelineRef.current, {
        x: -scrollWidth / 2,
        duration: 20,
        ease: "linear",
        repeat: -1,
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentData = currentHolding ? chartDataCache[currentHolding.ticker] : null;

  return (
    <div
      ref={modalRef}
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/80 transition-all duration-300 ${isExpanded ? "p-0" : "p-4 sm:p-6 lg:p-8"}`}
    >
      {/* Background glow effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-indigo-500/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-emerald-500/10 rounded-full blur-[150px]" />
      </div>

      <div
        ref={contentRef}
        onClick={(e) => e.stopPropagation()}
        className={`relative z-10 w-full overflow-hidden border border-white/10 bg-[#0a0f1d]/90 shadow-2xl backdrop-blur-2xl flex flex-col transition-all duration-500 ${
          isExpanded ? "h-screen rounded-none max-w-none" : "h-[90vh] rounded-[2xl] max-w-7xl"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Future Predictions
                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-500/20 text-blue-400 rounded-full flex items-center gap-1">
                  <Cpu className="w-3 h-3" /> AI GENERATED
                </span>
              </h2>
              <p className="text-sm text-gray-400">Projected 30-day performance based on stochastic modeling</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Sidebar Tabs */}
          <div className="w-64 border-r border-white/5 p-4 overflow-y-auto hidden md:block hide-scrollbar bg-black/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 ml-2">Active Holdings</h3>
            <div className="space-y-1">
              {holdings.map((h, i) => (
                <button
                  key={h.ticker}
                  onClick={() => setActiveTab(i)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-between group ${
                    activeTab === i
                      ? "bg-white/10 border border-white/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                      : "hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div>
                    <div className={`font-semibold transition-colors ${activeTab === i ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                      {h.ticker}
                    </div>
                    <div className="text-xs text-gray-500 truncate max-w-[120px]">{h.name}</div>
                  </div>
                  {activeTab === i && <TrendingUp className="w-4 h-4 text-blue-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Main Chart Area */}
          <div className="flex-1 p-6 flex flex-col relative w-full h-full">
            {/* Mobile Tabs */}
            <div className="w-full md:hidden flex overflow-x-auto gap-2 pb-4 mb-4 border-b border-white/5 hide-scrollbar">
               {holdings.map((h, i) => (
                 <button
                   key={h.ticker}
                   onClick={() => setActiveTab(i)}
                   className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                     activeTab === i
                       ? "bg-white/10 text-white border border-white/10"
                       : "text-gray-400 hover:text-white hover:bg-white/5"
                   }`}
                 >
                   {h.ticker}
                 </button>
               ))}
            </div>

            <div className="flex-1 relative rounded-2xl border border-white/10 bg-[#060912] overflow-hidden group flex items-center justify-center">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50 backdrop-blur-sm">
                  <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                </div>
              ) : currentData ? (
                <ChartComponent data={currentData} ticker={currentHolding.ticker} />
              ) : null}

              {/* Decorative scanline overlay (pointer events none so we can hover chart) */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_2px] z-10 mix-blend-overlay opacity-30" />
            </div>
          </div>
        </div>

        {/* Animated Timeline Footer */}
        <div className="h-16 lg:h-20 border-t border-white/5 bg-black/40 flex flex-col justify-center overflow-hidden relative shrink-0">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0a0f1d] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0a0f1d] to-transparent z-10 pointer-events-none" />
          
          <div className="flex items-center gap-2 px-6 mb-1 text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">
            <Clock className="w-3 h-3" /> Predictive Timeline Events
          </div>

          <div className="flex whitespace-nowrap relative w-[200%] gap-8 px-6 text-sm" ref={timelineRef}>
            {[1, 2].map((loopIndex) => (
              <React.Fragment key={loopIndex}>
                <TimelineItem ticker="TCS" msg="Projected resistance breakout at +4.2%" color="text-emerald-400" border="border-emerald-500/20" bg="bg-emerald-500/10" dot="bg-emerald-400"/>
                <TimelineItem ticker="HDFCBANK" msg="Volatility approaching normal bounds" color="text-yellow-400" border="border-yellow-500/20" bg="bg-yellow-500/10" dot="bg-yellow-400"/>
                <TimelineItem ticker="RELIANCE" msg="Strong momentum cluster detected next week" color="text-blue-400" border="border-blue-500/20" bg="bg-blue-500/10" dot="bg-blue-400"/>
                <TimelineItem ticker="INFY" msg="Potential consolidation phase starting Day 12" color="text-purple-400" border="border-purple-500/20" bg="bg-purple-500/10" dot="bg-purple-400"/>
                <TimelineItem ticker="VXUS" msg="Macro trend maintaining positive drift" color="text-emerald-400" border="border-emerald-500/20" bg="bg-emerald-500/10" dot="bg-emerald-400"/>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ ticker, msg, color, border, bg, dot }: { ticker: string, msg: string, color: string, border: string, bg: string, dot: string }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-1.5 lg:py-2 rounded-full border ${border} ${bg} flex-shrink-0 backdrop-blur-sm`}>
      <span className={`w-2 h-2 rounded-full ${dot} animate-pulse`} />
      <span className="font-bold text-white text-xs lg:text-sm">{ticker}</span>
      <span className={`${color} text-xs lg:text-sm`}>{msg}</span>
    </div>
  );
}

// Sub-component to manage lightweight-charts instance
function ChartComponent({ data, ticker }: { data: any[], ticker: string }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chartOptions = {
      layout: {
        textColor: '#8b9bb4',
        background: { type: ColorType.Solid, color: 'transparent' },
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      crosshair: {
        mode: 1, // Magnet
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
    };

    const chart = createChart(chartContainerRef.current, chartOptions);
    chartRef.current = chart;

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#00ff88',
      downColor: '#ff3366',
      borderVisible: false,
      wickUpColor: '#00ff88',
      wickDownColor: '#ff3366',
    });

    candlestickSeries.setData(data);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Initial resize to fit container properly
    setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  return (
    <div className="relative w-full h-full p-2">
      <div className="absolute top-4 left-4 z-10 text-white/50 text-2xl font-bold tracking-widest uppercase pointer-events-none mix-blend-overlay">
        {ticker} - 30 DAY PREDICTION
      </div>
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}
