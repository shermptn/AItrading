import { useState } from 'react';
import AILaunchpad from './AILaunchpad';
import MainChart from './MainChart';
import NewsTicker from './NewsTicker';
import Watchlist from './Watchlist';

export default function CommandCenter() {
  const [activeSymbol, setActiveSymbol] = useState('SPY');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* News Ticker - Left Column */}
        <div className="lg:col-span-3">
          <NewsTicker />
        </div>

        {/* Main Chart - Center Column */}
        <div className="lg:col-span-6">
          <MainChart symbol={activeSymbol} />
        </div>

        {/* Watchlist - Right Column */}
        <div className="lg:col-span-3">
          <Watchlist onSymbolSelect={setActiveSymbol} />
        </div>
      </div>

      {/* AI Launchpad - Full Width Section */}
      <div>
        <AILaunchpad initialSymbol={activeSymbol} />
      </div>
    </div>
  );
}
