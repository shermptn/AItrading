import React from 'react';
import { 
  StockHeatmapWidget, 
  CryptoHeatmapWidget, 
  TickerTapeWidget,
  AdvancedChartWidget,
  EconomicCalendarWidget,
  ForexScreenerWidget,
  MarketQuotesWidget,
  TimelineWidget
} from '../components/tradingview';
import ErrorBoundary from "../components/common/ErrorBoundary";

function MarketPulsePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white mb-4">Market Pulse</h1>
      
      <ErrorBoundary>
        <TickerTapeWidget />
      </ErrorBoundary>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-neutral-900 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3 text-white">Stock Market Heatmap</h2>
          <div className="h-[500px]">
            <ErrorBoundary>
              <StockHeatmapWidget />
            </ErrorBoundary>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3 text-white">Crypto Market Heatmap</h2>
          <div className="h-[500px]">
            <ErrorBoundary>
              <CryptoHeatmapWidget />
            </ErrorBoundary>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-neutral-900 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3 text-white">Advanced Chart</h2>
          <div className="h-[400px]">
            <ErrorBoundary>
              <AdvancedChartWidget />
            </ErrorBoundary>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3 text-white">Market Quotes</h2>
          <div className="h-[400px]">
            <ErrorBoundary>
              <MarketQuotesWidget />
            </ErrorBoundary>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-neutral-900 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3 text-white">Forex Screener</h2>
          <div className="h-[400px]">
            <ErrorBoundary>
              <ForexScreenerWidget />
            </ErrorBoundary>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3 text-white">Economic Calendar</h2>
          <div className="h-[400px]">
            <ErrorBoundary>
              <EconomicCalendarWidget />
            </ErrorBoundary>
          </div>
        </div>
      </div>
      
      <div className="bg-neutral-900 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3 text-white">Market Timeline</h2>
        <div className="h-[400px]">
          <ErrorBoundary>
            <TimelineWidget />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

export default MarketPulsePage;
