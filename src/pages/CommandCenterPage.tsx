import { useState } from 'react';
import AILaunchpad from '../components/CommandCenter/AILaunchpad';
import MainChart from '../components/CommandCenter/MainChart';
import NewsTicker from '../components/CommandCenter/NewsTicker';
import Watchlist from '../components/CommandCenter/Watchlist';
import DeepDiveModal from '../components/DeepDive/DeepDiveModal';

export default function CommandCenterPage() {
  const [activeSymbol, setActiveSymbol] = useState('SPY');
  const [deepDiveSymbol, setDeepDiveSymbol] = useState<string | null>(null);

  // This is the new "click-to-analyze" flow
  const handleSymbolSelect = (symbol: string) => {
    setActiveSymbol(symbol); // Update the chart
    setDeepDiveSymbol(symbol); // Open the analysis modal
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 lg:h-[520px]"><NewsTicker /></div>
        <div className="lg:col-span-6"><MainChart symbol={activeSymbol} /></div>
        <div className="lg:col-span-3 lg:h-[520px]"><Watchlist onSymbolSelect={handleSymbolSelect} /></div>
      </div>
      
      {/* The AI Launchpad is now a secondary tool */}
      <div className="mt-8">
        <AILaunchpad initialSymbol={activeSymbol} onAnalyze={setDeepDiveSymbol} />
      </div>

      {deepDiveSymbol && (
        <DeepDiveModal symbol={deepDiveSymbol} onClose={() => setDeepDiveSymbol(null)} />
      )}
    </>
  );
}
