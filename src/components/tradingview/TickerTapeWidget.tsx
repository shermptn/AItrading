import React, { useRef } from 'react';
import { useTradingViewWidget } from '../../hooks/useTradingViewWidget';

const widgetConfig = {
  "symbols": [
    {"proName": "FOREXCOM:SPXUSD", "title": "S&P 500"},
    {"proName": "FOREXCOM:NSXUSD", "title": "US 100"},
    {"proName": "BITSTAMP:BTCUSD", "title": "Bitcoin"},
    {"proName": "BITSTAMP:ETHUSD", "title": "Ethereum"},
    {"proName": "NASDAQ:TSLA", "title": "Tesla"},
    {"proName": "NASDAQ:META", "title": "Meta"},
    {"proName": "NASDAQ:MSFT", "title": "Microsoft"},
    {"proName": "OANDA:XAUUSD", "title": "Gold"},
    {"proName": "NASDAQ:NVDA", "title": "NVIDIA"},
    {"proName": "NASDAQ:AAPL", "title": "Apple"}
  ],
  "colorTheme": "dark", "locale": "en", "isTransparent": false, "showSymbolLogo": true, "displayMode": "adaptive"
};

function TickerTapeWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  useTradingViewWidget({
    widgetScriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js",
    widgetConfig,
    containerRef
  });

  return <div className="tradingview-widget-container" ref={containerRef} style={{ height: "72px", width: "100%" }}></div>;
}

export default React.memo(TickerTapeWidget);
