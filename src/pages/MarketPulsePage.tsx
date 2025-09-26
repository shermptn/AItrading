import TradingViewWidget from '../components/MarketPulse/TradingViewWidget';
import HeatmapWidget from '../components/MarketPulse/HeatmapWidget';

export default function MarketPulsePage() {
  return (
    <div className="space-y-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white">Market Pulse</h1>
        <p className="text-neutral-400">
          A top-down view of the global market landscape. Current time in Calabasas, CA:{" "}
          {new Date().toLocaleTimeString("en-US", { timeZone: "America/Los_Angeles" })}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Column 1: Index Futures */}
        <div>
          <TradingViewWidget
            widgetSrc="https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js"
            widgetConfig={{
              width: "100%",
              height: 500,
              colorTheme: "dark",
              symbolsGroups: [
                {
                  name: "Index Futures",
                  symbols: [
                    { name: "SPX", displayName: "S&P 500 Index" },
                    { name: "NDX", displayName: "Nasdaq 100 Index" },
                    { name: "DJI", displayName: "Dow 30 Index" }
                  ],
                },
              ],
              showSymbolLogo: true,
              isTransparent: false,
              locale: "en",
            }}
            height={500}
          />
        </div>

        {/* Column 2: Treasury Yields */}
        <div>
          <TradingViewWidget
            widgetSrc="https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js"
            widgetConfig={{
              width: "100%",
              height: 500,
              colorTheme: "dark",
              symbolsGroups: [
                {
                  name: "Treasury Yields",
                  symbols: [
                    { name: "TVC:US10Y", displayName: "US 10-Year Yield" },
                    { name: "TVC:US02Y", displayName: "US 2-Year Yield" }
                  ],
                },
              ],
              showSymbolLogo: true,
              isTransparent: false,
              locale: "en",
            }}
            height={500}
          />
        </div>

        {/* Column 3: Commodities & Forex */}
        <div>
          <TradingViewWidget
            widgetSrc="https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js"
            widgetConfig={{
              width: "100%",
              height: 500,
              colorTheme: "dark",
              symbolsGroups: [
                {
                  name: "Commodities & Forex",
                  symbols: [
                    { name: "TVC:DXY", displayName: "US Dollar Index" },
                    { name: "FX:EURUSD", displayName: "EUR/USD" },
                    { name: "TVC:VIX", displayName: "Volatility Index (VIX)" },
                  ],
                },
              ],
              showSymbolLogo: true,
              isTransparent: false,
              locale: "en",
            }}
            height={500}
          />
        </div>

        {/* Column 4: Gold & Oil */}
        <div>
          <TradingViewWidget
            widgetSrc="https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js"
            widgetConfig={{
              width: "100%",
              height: 500,
              colorTheme: "dark",
              symbolsGroups: [
                {
                  name: "Gold & Oil",
                  symbols: [
                    { name: "COMEX:GC1!", displayName: "Gold" },
                    { name: "NYMEX:CL1!", displayName: "Crude Oil (WTI)" }
                  ],
                },
              ],
              showSymbolLogo: true,
              isTransparent: false,
              locale: "en",
            }}
            height={500}
          />
        </div>

        {/* S&P 500 Sector Heatmap spans both columns and is taller */}
        <div className="md:col-span-2">
          <HeatmapWidget />
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-neutral-400">
        <span>
          <strong>Note:</strong> Some market data may be delayed or unavailable due to exchange licensing restrictions in TradingView widgets.
        </span>
      </div>
    </div>
  );
}
