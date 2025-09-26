import { useEffect, useRef } from 'react';

interface Props {
  initialSymbol: string;
}

/**
 * TVWidgetsLoader
 * Renders TradingView advanced chart and market overview widgets inside Market Pulse.
 * The ticker was removed from here so it can be rendered once (for example in the header).
 * This loader keeps a retry UI and robust iframe polling/cleanup.
 */
export default function TVWidgetsLoader({ initialSymbol }: Props) {
  const containers = {
    // ticker removed to avoid duplicate ticker on the page
    advancedChart: useRef<HTMLDivElement | null>(null),
    overview: useRef<HTMLDivElement | null>(null),
  };

  function safeClear(node: HTMLElement) {
    try {
      while (node.firstChild) {
        try {
          if (node.contains(node.firstChild)) node.removeChild(node.firstChild);
          else break;
        } catch {
          break;
        }
      }
    } catch {
      try {
        node.innerHTML = '';
      } catch {
        // ignore
      }
    }
  }

  // Helper to inject and fallback with robust waiting for the iframe
  function injectWidget(container: HTMLDivElement, src: string, config: any) {
    if (!container) return;

    safeClear(container);

    const widgetWrapper = document.createElement('div');
    widgetWrapper.className = 'tradingview-widget-container__widget';
    container.appendChild(widgetWrapper);

    const script = document.createElement('script');
    script.src = src;
    script.type = 'text/javascript';
    script.async = true;
    script.textContent = JSON.stringify(config);
    script.setAttribute('data-tv-injected', '1');

    container.appendChild(script);

    // Poll for iframe and contentWindow
    const maxAttempts = 8;
    let attempt = 0;
    const interval = 600;

    const checkReady = () => {
      attempt += 1;
      const iframe = container.querySelector('iframe') as HTMLIFrameElement | null;
      if (iframe && iframe.contentWindow) {
        // loaded successfully
        return;
      }
      if (attempt >= maxAttempts) {
        // fallback UI
        safeClear(container);
        try {
          container.innerHTML = `
            <div style="padding:18px;text-align:center;color:#fbbf24;">
              <strong>TradingView widget failed to load.</strong><br/>
              If you use an adblocker or privacy browser, allow scripts from <b>s3.tradingview.com</b> and refresh.<br/>
              <button id="tv-retry-btn" style="margin-top:10px;padding:6px 14px;background:#fde68a;color:#222;border-radius:6px;border:none;cursor:pointer;">Retry</button>
            </div>
          `;
          const btn = container.querySelector('#tv-retry-btn');
          if (btn) btn.addEventListener('click', () => injectWidget(container, src, config), { once: true });
        } catch {
          // ignore fallback render errors
        }
        return;
      }
      setTimeout(checkReady, interval);
    };

    setTimeout(checkReady, 400);
  }

  useEffect(() => {
    // Advanced chart: ensure it uses full width and a larger height so it isn't tiny.
    if (containers.advancedChart.current) {
      injectWidget(
        containers.advancedChart.current,
        'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js',
        {
          symbol: initialSymbol,
          colorTheme: 'dark',
          autosize: false,    // use explicit width/height to force size
          width: "100%",
          height: 500,
        }
      );
    }

    // Overview: larger and full width
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
      // cleanup safely
      Object.values(containers).forEach(ref => {
        const node = ref.current;
        if (node) safeClear(node);
      });
    };
  }, [initialSymbol]);

  return (
    <div className="space-y-6">
      <div ref={containers.advancedChart} className="w-full" />
      <div ref={containers.overview} className="w-full" />
    </div>
  );
}
