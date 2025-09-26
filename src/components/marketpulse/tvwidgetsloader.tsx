import { useEffect, useRef } from 'react';

/**
 * TVWidgetsLoader
 * - Renders the container divs with the IDs the TradingView embed scripts expect.
 * - Injects each TradingView widget by creating a <script> tag whose textContent is the JSON config.
 * - Runs only on client (useEffect). Cleans up containers on unmount.
 *
 * Usage: <TVWidgetsLoader initialSymbol="AAPL" />
 */

interface Props {
  initialSymbol?: string;
}

export default function TVWidgetsLoader({ initialSymbol = 'AAPL' }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Helper: inject widget script into container with JSON config
  function injectTVWidget(containerId: string, src: string, config: Record<string, any>) {
    const container = document.getElementById(containerId);
    if (!container) return;
    // clear any previous content
    container.innerHTML = '';
    // wrapper element that many TradingView embeds expect
    const inner = document.createElement('div');
    inner.className = 'tradingview-widget-container__widget';
    container.appendChild(inner);

    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = src;
    // tradingview expects the config as the script's text content in JSON
    s.text = JSON.stringify(config);
    container.appendChild(s);
  }

  // symbol mapping helper
  function tvMapSymbol(sym?: string) {
    const s = (sym || initialSymbol).toUpperCase();
    if (s === 'NAS100' || s === 'NDX') return 'NASDAQ:NDX';
    const map: Record<string, string> = {
      AAPL: 'NASDAQ:AAPL',
      MSFT: 'NASDAQ:MSFT',
      GOOGL: 'NASDAQ:GOOGL',
      AMZN: 'NASDAQ:AMZN',
      META: 'NASDAQ:META',
      NVDA: 'NASDAQ:NVDA',
      TSLA: 'NASDAQ:TSLA',
      QQQ: 'NASDAQ:QQQ',
      SPY: 'AMEX:SPY',
      SPX: 'FOREXCOM:SPXUSD',
    };
    return map[s] || s;
  }

  // All render functions (copied/adapted from your original JS)
  function renderTVTicker() {
    const symbols = [
      { proName: 'NASDAQ:AAPL', title: 'AAPL' },
      { proName: 'NASDAQ:MSFT', title: 'MSFT' },
      { proName: 'NASDAQ:GOOGL', title: 'GOOGL' },
      { proName: 'NASDAQ:AMZN', title: 'AMZN' },
      { proName: 'NASDAQ:META', title: 'META' },
      { proName: 'NASDAQ:NVDA', title: 'NVDA' },
      { proName: 'NASDAQ:TSLA', title: 'TSLA' },
      { proName: 'NASDAQ:QQQ', title: 'QQQ' },
      { proName: 'AMEX:SPY', title: 'SPY' }
    ];
    injectTVWidget('tvTicker', 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js', {
      symbols, showSymbolLogo: true, isTransparent: false, largeChartUrl: '', displayMode: 'adaptive', colorTheme: 'dark', locale: 'en'
    });
  }

  function renderTVAdvanced(sym?: string) {
    const symbol = tvMapSymbol(sym);
    injectTVWidget('tvAdvanced', 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js', {
      allow_symbol_change: true, calendar: false, details: false,
      hide_side_toolbar: true, hide_top_toolbar: false, hide_legend: false, hide_volume: false,
      interval: 'D', locale: 'en', style: '1', symbol, theme: 'dark', timezone: 'Etc/UTC', autosize: true
    });
  }

  function renderTVOverview() {
    injectTVWidget('tvOverview', 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js', {
      lineWidth: 2, lineType: 0, chartType: 'area', colorTheme: 'dark', isTransparent: false, locale: 'en', autosize: true,
      symbols: [
        ['Apple', 'NASDAQ:AAPL|1D'], ['Google', 'NASDAQ:GOOGL|1D'], ['Microsoft', 'NASDAQ:MSFT|1D'],
        ['NASDAQ:TSLA|1D'], ['NASDAQ:META|1D'], ['NASDAQ:AMZN|1D'], ['NASDAQ:NVDA|1D'], ['AMEX:SPY|1D'], ['NASDAQ:QQQ|1D']
      ]
    });
  }

  function renderTVTimeline() {
    injectTVWidget('tvTimeline', 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js', {
      displayMode: 'regular', feedMode: 'all_symbols', colorTheme: 'dark', isTransparent: false, locale: 'en', width: '100%', height: 550
    });
  }

  function renderTVEvents() {
    injectTVWidget('tvEvents', 'https://s3.tradingview.com/external-embedding/embed-widget-events.js', {
      colorTheme: 'dark', isTransparent: false, locale: 'en', countryFilter: 'us,gb,eu,ca,jp', importanceFilter: '-1,0,1', width: '100%', height: 550
    });
  }

  function renderTVScreener() {
    injectTVWidget('tvScreener', 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js', {
      market: 'stocks', showToolbar: true, defaultColumn: 'overview', defaultScreen: 'general', isTransparent: false, locale: 'en', colorTheme: 'dark', width: '100%', height: 550
    });
  }

  function renderTVHeatmap() {
    injectTVWidget('tvHeatmap', 'https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js', {
      dataSource: 'SPX500', blockSize: 'market_cap_basic', blockColor: 'change', grouping: 'sector', locale: 'en', colorTheme: 'dark', width: '100%', height: '100%', isZoomEnabled: true
    });
  }

  function renderTVQuotes() {
    injectTVWidget('tvQuotes', 'https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js', {
      colorTheme: 'dark', locale: 'en', isTransparent: false, showSymbolLogo: true, backgroundColor: '#0F0F0F', width: '100%', height: 550,
      symbolsGroups: [
        { name: 'Indices', symbols: [{ name: 'FOREXCOM:SPXUSD', displayName: 'S&P 500 Index' }, { name: 'FOREXCOM:NSXUSD', displayName: 'US 100 Cash CFD' }, { name: 'NASDAQ:QQQ', displayName: 'QQQ' }] },
        { name: 'Forex', symbols: [{ name: 'FX:EURUSD', displayName: 'EURUSD' }, { name: 'FX:GBPUSD', displayName: 'GBPUSD' }, { name: 'FX:USDJPY', displayName: 'USDJPY' }] }
      ]
    });
  }

  function renderTVTechnicals() {
    injectTVWidget('tvTechnicals', 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js', {
      colorTheme: 'dark', displayMode: 'single', isTransparent: false, locale: 'en', interval: '1m', disableInterval: false, width: '100%', height: 450, symbol: 'NASDAQ:NDX', showIntervalTabs: true
    });
  }

  function renderTVAll(symbol?: string) {
    renderTVTicker();
    renderTVAdvanced(symbol || initialSymbol);
    renderTVOverview();
    renderTVTimeline();
    renderTVEvents();
    renderTVQuotes();
    renderTVTechnicals();
    // Lazy load heavy widgets separately (screener/heatmap) - call immediately too so they appear in this example
    renderTVScreener();
    renderTVHeatmap();
  }

  useEffect(() => {
    // Only run client-side
    if (typeof window === 'undefined') return;
    // Render widgets
    renderTVAll(initialSymbol);

    // Cleanup: clear the innerHTML of each container on unmount so re-renders reattach cleanly
    return () => {
      const ids = ['tvTicker','tvAdvanced','tvOverview','tvTimeline','tvEvents','tvScreener','tvHeatmap','tvQuotes','tvTechnicals'];
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
      });
    };
    // initialSymbol intentionally excluded from deps to avoid re-inserting scripts on symbol change here
    // If you want to update symbol dynamically, call renderTVAdvanced(newSymbol) from parent or enhance this component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Layout: two-column grid; heatmap spans both columns.
  return (
    <div ref={rootRef} className="space-y-6">
      {/* Ticker (small strip) */}
      <div id="tvTicker" className="rounded-lg overflow-hidden" style={{ height: 44 }} />

      {/* Large advanced chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div id="tvAdvanced" className="bg-neutral-900 rounded-lg p-3" style={{ minHeight: 520 }} />
        <div className="space-y-6">
          <div id="tvOverview" className="bg-neutral-900 rounded-lg p-3" style={{ minHeight: 240 }} />
          <div id="tvQuotes" className="bg-neutral-900 rounded-lg p-3" style={{ minHeight: 240 }} />
          <div id="tvTechnicals" className="bg-neutral-900 rounded-lg p-3" style={{ minHeight: 240 }} />
        </div>
      </div>

      {/* Second row: timeline + events side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div id="tvTimeline" className="bg-neutral-900 rounded-lg p-3" style={{ minHeight: 420 }} />
        <div id="tvEvents" className="bg-neutral-900 rounded-lg p-3" style={{ minHeight: 420 }} />
      </div>

      {/* Screener + Heatmap: heatmap spans both columns and is taller */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div id="tvScreener" className="bg-neutral-900 rounded-lg p-3" style={{ minHeight: 520 }} />
        <div id="tvHeatmap" className="bg-neutral-900 rounded-lg p-3" style={{ minHeight: 520 }} />
      </div>
    </div>
  );
}
