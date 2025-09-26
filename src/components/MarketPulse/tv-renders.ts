import { injectTVWidget } from '../../utils/injectTVWidget';

// Ticker (no change besides per-container id)
export function renderTVTicker() {
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

// Advanced chart: prefer autosize:false with explicit height OR autosize:true + container with CSS height
export function renderTVAdvanced(sym: string) {
  const symbol = sym || 'NASDAQ:AAPL';
  // Use explicit size to avoid invisible widget if parent has no height
  injectTVWidget('tvAdvanced', 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js', {
    allow_symbol_change: true,
    calendar: false,
    details: false,
    hide_side_toolbar: true,
    hide_top_toolbar: false,
    hide_legend: false,
    hide_volume: false,
    interval: 'D',
    locale: 'en',
    style: '1',
    symbol,
    theme: 'dark',
    timezone: 'Etc/UTC',
    autosize: false,
    width: '100%',
    height: 600
  });
}

// Heatmap: DO NOT use height: '100%' unless the parent has explicit height. Use px height.
export function renderTVHeatmap() {
  injectTVWidget('tvHeatmap', 'https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js', {
    dataSource: 'SPX500',
    blockSize: 'market_cap_basic',
    blockColor: 'change',
    grouping: 'sector',
    locale: 'en',
    colorTheme: 'dark',
    width: '100%',
    height: 600,          // changed from '100%' to explicit pixel height
    isZoomEnabled: true
  });
}

// Example: screener and others should also use explicit heights
export function renderTVScreener() {
  injectTVWidget('tvScreener', 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js', {
    market: 'stocks',
    showToolbar: true,
    defaultColumn: 'overview',
    defaultScreen: 'general',
    isTransparent: false,
    locale: 'en',
    colorTheme: 'dark',
    width: '100%',
    height: 600
  });
}
