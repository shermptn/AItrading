import { useEffect, useRef } from 'react';

interface Props {
  initialSymbol: string;
}

/**
 * TVWidgetsLoader
 * Renders TradingView ticker tape, advanced chart, and market overview widgets.
 * If a widget is blocked by an adblocker, shows a fallback message.
 */
export default function TVWidgetsLoader({ initialSymbol }: Props) {
  const containers = {
    ticker: useRef<HTMLDivElement>(null),
    advancedChart: useRef<HTMLDivElement>(null),
    overview: useRef<HTMLDivElement>(null),
  };

  // Helper to inject and fallback
  function injectWidget(container: HTMLDivElement, src: string, config: any) {
    container.innerHTML = '';
    const widget = document.createElement('div');
    widget.className = 'tradingview-widget-container__widget';
    container.appendChild(widget);

    const script = document.createElement('script');
    script.src = src;
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify(config);
    container.appendChild(script);

    setTimeout(() => {
      const hasWidget = !!container.querySelector('iframe');
      if (!hasWidget) {
        container.innerHTML = `
          <div style="padding:18px;text-align:center;color:#fbbf24;">
            <strong>TradingView widget failed to load.</strong><br/>
            If you use an adblocker or privacy browser, allow scripts from <b>s3.tradingview.com</b> and refresh.<br/>
            <button id="tv-retry-btn" style="margin-top:10px;padding:6px 14px;background:#fde68a;color:#222;border-radius:6px;border:none;cursor:pointer;">Retry</button>
          </div>
        `;
        const btn = container.querySelector('#tv-retry-btn');
        if (btn) btn.addEventListener('click', () => injectWidget(container, src, config));
      }
    }, 2500);
  }

  useEffect(() => {
    if (containers.ticker.current) {
      injectWidget(
        containers.ticker.current,
        'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js',
        {
          symbols: [
            { proName: 'NASDAQ:AAPL', title: 'AAPL' },
            { proName: 'NASDAQ:MSFT', title: 'MSFT' },
            { proName: 'NASDAQ:GOOGL', title: 'GOOGL' },
            { proName: 'NASDAQ:AMZN', title: 'AMZN' },
            { proName: 'NASDAQ:META', title: 'META' },
            { proName: 'NASDAQ:NVDA', title: 'NVDA' },
            { proName: 'NASDAQ:TSLA', title: 'TSLA' },
            { proName: 'NASDAQ:QQQ', title: 'QQQ' },
            { proName: 'AMEX:SPY', title: 'SPY' }
          ],
          showSymbolLogo: true,
          isTransparent: true,
          displayMode: 'adaptive',
          colorTheme: 'dark',
          locale: 'en'
        }
      );
    }
    if (containers.advancedChart.current) {
      injectWidget(
        containers.advancedChart.current,
        'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js',
        {
          symbol: initialSymbol,
          colorTheme: 'dark',
          autosize: true,
        }
      );
    }
    if (containers.overview.current) {
      injectWidget(
        containers.overview.current,
        'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js',
        {
          colorTheme: "dark",
          width: "100%",
          height: 500,
          showChart: true,
          locale: "en",
          isTransparent: false,
          showSymbolLogo: true,
          tabs: [
            {
              title: "Indices",
              symbols: [
                { s: "FOREXCOM:SPXUSD", d: "S&P 500" },
                { s: "FOREXCOM:NSXUSD", d: "Nasdaq 100" },
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
      );
    }

    return () => {
      Object.values(containers).forEach(ref => { if (ref.current) ref.current.innerHTML = ''; });
    };
  }, [initialSymbol]);

  return (
    <div className="space-y-6">
      <div ref={containers.ticker} />
      <div ref={containers.advancedChart} />
      <div ref={containers.overview} />
    </div>
  );
}
