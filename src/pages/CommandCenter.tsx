import React, { useState } from 'react';
import {
  AdvancedChartWidget,
  ForexScreenerWidget,
  MarketQuotesWidget,
  TimelineWidget,
  EconomicCalendarWidget
} from '../components/tradingview';
// THIS IS THE CORRECTED LINE:
import ErrorBoundary from '../components/common/ErrorBoundary';
import Watchlist from '../components/CommandCenter/Watchlist';
import AILaunchpad from '../components/CommandCenter/AILaunchpad';

function CommandCenterPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('NASDAQ:NDX');

  const handleSymbolSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        
        {/* Main content area */}
        <div className="xl:col-span-3 space-y-4">
          <div className="h-[600px] bg-neutral-900 rounded-lg">
            <ErrorBoundary>
              <AdvancedChartWidget symbol={selectedSymbol} />
            </ErrorBoundary>
          </div>
          <div className="h-[550px] bg-neutral-900 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3 text-white">Forex Screener</h2>
            <ErrorBoundary>
              <ForexScreenerWidget />
            </ErrorBoundary>
          </div>
        </div>

        {/* Sidebar area */}
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-neutral-900 rounded-lg p-4">
             <AILaunchpad initialSymbol={selectedSymbol.split(':')[1] || 'NDX'} onAnalyze={() => {}} />
          </div>
          <div className="h-[550px]">
             <Watchlist onSymbolSelect={handleSymbolSelect} />
          </div>
        </div>
      </div>

      {/* Lower section with more widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-neutral-900 rounded-lg p-4 h-[600px]">
          <h2 className="text-lg font-semibold mb-3 text-white">Market Summary</h2>
          <ErrorBoundary>
            <MarketQuotesWidget />
          </ErrorBoundary>
        </div>
        <div className="bg-neutral-900 rounded-lg p-4 h-[600px]">
          <h2 className="text-lg font-semibold mb-3 text-white">Top Stories</h2>
          <ErrorBoundary>
            <TimelineWidget />
          </ErrorBoundary>
        </div>
        <div className="bg-neutral-900 rounded-lg p-4 h-[600px]">
          <h2 className="text-lg font-semibold mb-3 text-white">Economic Calendar</h2>
          <ErrorBoundary>
            <EconomicCalendarWidget />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

export default CommandCenterPage;
