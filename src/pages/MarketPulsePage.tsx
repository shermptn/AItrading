import FuturesWidget from '../components/MarketPulse/FuturesWidget';
import HeatmapWidget from '../components/MarketPulse/HeatmapWidget';
import MacroDataWidget from '../components/MarketPulse/MacroDataWidget';
import { YIELDS_SYMBOLS, COMMODITIES_FOREX_SYMBOLS, VOLATILITY_SYMBOLS } from '../config/marketPulseConfig';

export default function MarketPulsePage() {
  return (
    <div className="space-y-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white">Market Pulse</h1>
        <p className="text-neutral-400">A top-down view of the global market landscape. Current time in Calabasas, CA: {new Date().toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles' })}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Column 1 */}
        <div className="space-y-6">
          <FuturesWidget />
          <MacroDataWidget title="Volatility" symbols={VOLATILITY_SYMBOLS} />
        </div>

        {/* Column 2 */}
        <div className="space-y-6">
          <MacroDataWidget title="Treasury Yields" symbols={YIELDS_SYMBOLS} />
        </div>

        {/* Column 3 */}
        <div className="space-y-6">
          <MacroDataWidget title="Commodities & Forex" symbols={COMMODITIES_FOREX_SYMBOLS} />
        </div>

        {/* Column 4 - Heatmap */}
        <div className="lg:col-span-1 md:col-span-2">
           <HeatmapWidget />
        </div>
      </div>
    </div>
  );
}
