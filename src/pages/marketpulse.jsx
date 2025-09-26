import React from 'react';
import { StockHeatmapWidget, CryptoHeatmapWidget, TickerTapeWidget } from '../components/tradingview';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

function MarketPulse() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-white">Market Pulse</h1>
      
      {/* Ticker Tape at the top */}
      <ErrorBoundary>
        <TickerTapeWidget />
      </ErrorBoundary>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Stock Heatmap */}
        <div className="bg-neutral-900 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3 text-white">Stock Market Heatmap</h2>
          <div className="h-[500px]">
            <ErrorBoundary>
              <StockHeatmapWidget />
            </ErrorBoundary>
          </div>
        </div>

        {/* Crypto Heatmap */}
        <div className="bg-neutral-900 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3 text-white">Crypto Market Heatmap</h2>
          <div className="h-[500px]">
            <ErrorBoundary>
              <CryptoHeatmapWidget />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarketPulse;
