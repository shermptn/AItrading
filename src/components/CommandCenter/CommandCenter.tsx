import { useState } from 'react';
import AILaunchpad from './AILaunchpad';
import MainChart from './MainChart';
import NewsTicker from './NewsTicker';
import Watchlist from './Watchlist';
import DeepDiveModal from '../DeepDive/DeepDiveModal'; // <-- Import the modal

export default function CommandCenter() {
  const [activeSymbol, setActiveSymbol] = useState('SPY');
  const [deepDiveSymbol, setDeepDiveSymbol] = useState<string | null>(null);

  // Function to open the modal
  const handleAnalysis = (symbol: string) => {
    setDeepDiveSymbol(symbol);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <NewsTicker />
          </div>
          <div className="lg:col-span-6">
            <MainChart symbol={activeSymbol} />
          </div>
          <div className="lg:col-span-3">
            <Watchlist onSymbolSelect={setActiveSymbol} />
          </div>
        </div>
        <div>
          <AILaunchpad initialSymbol={activeSymbol} onAnalyze={handleAnalysis} />
        </div>
      </div>
      
      {/* Conditionally render the modal */}
      {deepDiveSymbol && (
        <DeepDiveModal symbol={deepDiveSymbol} onClose={() => setDeepDiveSymbol(null)} />
      )}
    </>
  );
}
