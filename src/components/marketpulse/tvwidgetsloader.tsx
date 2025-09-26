import { useEffect, useRef } from 'react';

interface Props {
  initialSymbol: string;
}

export default function TVWidgetsLoader({ initialSymbol }: Props) {
  const symbolRef = useRef(initialSymbol);
  const containers = {
    overview: useRef<HTMLDivElement>(null),
    technicals: useRef<HTMLDivElement>(null),
    markets: useRef<HTMLDivElement>(null),
    economic: useRef<HTMLDivElement>(null),
    heatmap: useRef<HTMLDivElement>(null)
  };

  useEffect(() => {
    // Helper to inject widget script
    const injectWidget = (container: HTMLDivElement, src: string, config: any) => {
      const script = document.createElement('script');
      script.src = src;
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = JSON.stringify(config);
      container.appendChild(script);
      return script;
    };

    const scripts: HTMLScriptElement[] = [];

    // Market Overview
    if (containers.overview.current) {
      containers.overview.current.innerHTML = '';
      scripts.push(injectWidget(
        containers.overview.current,
        'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js',
        {
          colorTheme: "dark",
          dateRange: "1D",
          showChart: true,
          locale: "en",
          largeChartUrl: "",
          isTransparent: false,
          showSymbolLogo: true,
          showFloatingTooltip: false,
          width: "100%",
          height: "500",
          tabs: [
            {
              title: "Indices",
              symbols: [
                { s: "FOREXCOM:SPXUSD", d: "S&P 500" },
                { s: "FOREXCOM:NSXUSD", d: "US 100" },
                { s: "FOREXCOM:DJI", d: "Dow 30" }
              ],
              originalTitle: "Indices"
            },
            {
              title: "Tech Leaders",
              symbols: [
                { s: "NASDAQ:AAPL", d: "Apple" },
                { s: "NASDAQ:MSFT", d: "Microsoft" },
                { s: "NASDAQ:GOOGL", d: "Google" }
              ],
              originalTitle: "Tech Leaders"
            }
          ]
        }
      ));
    }

    // Technical Analysis
    if (containers.technicals.current) {
      containers.technicals.current.innerHTML = '';
      scripts.push(injectWidget(
        containers.technicals.current,
        'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js',
        {
          interval: "1D",
          width: "100%",
          isTransparent: false,
          height: "500",
          symbol: "NASDAQ:AAPL",
          showIntervalTabs: true,
          locale: "en",
          colorTheme: "dark"
        }
      ));
    }

    // Market Quotes
    if (containers.markets.current) {
      containers.markets.current.innerHTML = '';
      scripts.push(injectWidget(
        containers.markets.current,
        'https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js',
        {
          width: "100%",
          height: "500",
          symbolsGroups: [
            {
              name: "Indices",
              originalName: "Indices",
              symbols: [
                { name: "FOREXCOM:SPXUSD", displayName: "S&P 500" },
                { name: "FOREXCOM:NSXUSD", displayName: "US 100" },
                { name: "FOREXCOM:DJI", displayName: "Dow 30" }
              ]
            },
            {
              name: "Tech",
              originalName: "Tech",
              symbols: [
                { name: "NASDAQ:AAPL", displayName: "Apple" },
                { name: "NASDAQ:MSFT", displayName: "Microsoft" },
                { name: "NASDAQ:GOOGL", displayName: "Google" }
              ]
            }
          ],
          showSymbolLogo: true,
          colorTheme: "dark",
          isTransparent: false,
          locale: "en"
        }
      ));
    }

    // Economic Calendar
    if (containers.economic.current) {
      containers.economic.current.innerHTML = '';
      scripts.push(injectWidget(
        containers.economic.current,
        'https://s3.tradingview.com/external-embedding/embed-widget-events.js',
        {
          width: "100%",
          height: "500",
          colorTheme: "dark",
          isTransparent: false,
          locale: "en",
          importanceFilter: "-1,0,1"
        }
      ));
    }

    // Heatmap
    if (containers.heatmap.current) {
      containers.heatmap.current.innerHTML = '';
      scripts.push(injectWidget(
        containers.heatmap.current,
        'https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js',
        {
          exchanges: ["NASDAQ"],
          dataSource: "SPX500",
          grouping: "sector",
          blockSize: "market_cap_basic",
          blockColor: "change",
          locale: "en",
          symbolUrl: "",
          colorTheme: "dark",
          hasVolume: true,
          width: "100%",
          height: "500"
        }
      ));
    }

    return () => {
      scripts.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, [symbolRef.current]);

  return (
    <div className="space-y-6">
      {/* Grid layout for widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Overview */}
        <div className="bg-neutral-900 p-4 rounded-xl">
          <h3 className="text-lg font-semibold mb-3 text-white">Market Overview</h3>
          <div ref={containers.overview} className="tradingview-widget-container">
            <div className="tradingview-widget-container__widget"></div>
          </div>
        </div>

        {/* Technical Analysis */}
        <div className="bg-neutral-900 p-4 rounded-xl">
          <h3 className="text-lg font-semibold mb-3 text-white">Technical Analysis</h3>
          <div ref={containers.technicals} className="tradingview-widget-container">
            <div className="tradingview-widget-container__widget"></div>
          </div>
        </div>
      </div>

      {/* Full width heat map */}
      <div className="bg-neutral-900 p-4 rounded-xl">
        <h3 className="text-lg font-semibold mb-3 text-white">S&P 500 Sector Heatmap</h3>
        <div ref={containers.heatmap} className="tradingview-widget-container">
          <div className="tradingview-widget-container__widget"></div>
        </div>
      </div>

      {/* Second row of widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Quotes */}
        <div className="bg-neutral-900 p-4 rounded-xl">
          <h3 className="text-lg font-semibold mb-3 text-white">Market Quotes</h3>
          <div ref={containers.markets} className="tradingview-widget-container">
            <div className="tradingview-widget-container__widget"></div>
          </div>
        </div>

        {/* Economic Calendar */}
        <div className="bg-neutral-900 p-4 rounded-xl">
          <h3 className="text-lg font-semibold mb-3 text-white">Economic Calendar</h3>
          <div ref={containers.economic} className="tradingview-widget-container">
            <div className="tradingview-widget-container__widget"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
