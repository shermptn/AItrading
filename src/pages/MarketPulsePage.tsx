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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Column 1: Index Futures */}
        <div>
          <TradingViewWidget
            widgetSrc="https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js"
            widgetConfig={{
              width: "100%",
              height: 400,
              colorTheme: "dark",
              symbolsGroups: [
                {
                  name: "Index Futures",
                  symbols: [
                    { name: "CME_MINI:ES1!", displayName: "S&P 500 Futures" },
                    { name: "CME_MINI:NQ1!", displayName: "Nasdaq 100 Futures" },
                    { name: "CBOT:YM1!", displayName: "Dow 30 Futures" },
                  ],
                },
              ],
              showSymbolLogo: true,
              isTransparent: false,
              locale: "en",
            }}
            height={400}
          />
        </div>

        {/* Column 2: Treasury Yields */}
        <div>
          <TradingViewWidget
            widgetSrc="https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js"
            widgetConfig={{
              width: "100%",
              height: 400,
              colorTheme: "dark",
              symbolsGroups: [
                {
                  name: "Treasury Yields",
                  symbols: [
                    { name: "TVC:US10Y", displayName: "US 10-Year Yield" },
                    { name: "TVC:US02Y", displayName: "US 2-Year Yield" },
                  ],
                },
              ],
              showSymbolLogo: true,
              isTransparent: false,
              locale: "en",
            }}
            height={400}
          />
        </div>

        {/* Column 3: Commodities & Forex */}
        <div>
          <TradingViewWidget
            widgetSrc="https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js"
            widgetConfig={{
              width: "100%",
              height: 400,
              colorTheme: "dark",
              symbolsGroups: [
                {
                  name: "Commodities & Forex",
                  symbols: [
                    { name: "NYMEX:CL1!", displayName: "Crude Oil (WTI)" },
                    { name: "COMEX:GC1!", displayName: "Gold" },
                    { name: "TVC:DXY", displayName: "US Dollar Index" },
                    { name: "FX:EURUSD", displayName: "EUR/USD" },
                  ],
                },
              ],
              showSymbolLogo: true,
              isTransparent: false,
              locale: "en",
            }}
            height={400}
          />
        </div>

        {/* Column 4: S&P 500 Sector Heatmap */}
        <div>
          <HeatmapWidget />
        </div>
      </div>
    </div>
  );
}
