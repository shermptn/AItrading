import TVWidgetsLoader from '../components/MarketPulse/TVWidgetsLoader';

export default function MarketPulsePage() {
  const currentTime = new Date().toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles' });

  return (
    <div className="space-y-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white">Market Pulse</h1>
        <p className="text-neutral-400">
          A top-down view of the global market landscape. Current time in Calabasas, CA: {currentTime}
        </p>
      </header>

      {/* The TVWidgetsLoader renders all TradingView containers and injects widgets client-side */}
      <TVWidgetsLoader initialSymbol="AAPL" />

      <div className="mt-4 text-center text-sm text-neutral-400">
        <strong>Note:</strong> Some market data may be delayed or unavailable due to exchange licensing restrictions in TradingView widgets.
      </div>
    </div>
  );
}
