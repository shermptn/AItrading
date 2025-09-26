import React, { useRef } from 'react';
import { useTradingViewWidget } from '../../hooks/useTradingViewWidget';

const widgetConfig = {
  "allow_symbol_change": true, "calendar": false, "details": false, "hide_side_toolbar": true,
  "hide_top_toolbar": false, "hide_legend": false, "hide_volume": false, "hotlist": false,
  "interval": "D", "locale": "en", "save_image": true, "style": "1", "symbol": "NASDAQ:NDX",
  "theme": "dark", "timezone": "Etc/UTC", "backgroundColor": "#0F0F0F",
  "gridColor": "rgba(242, 242, 242, 0.06)",
  "watchlist": ["NASDAQ:NDX", "SP:SPX", "NASDAQ:TSLA", "NASDAQ:NVDA", "NASDAQ:META", "OANDA:XAUUSD", "NASDAQ:MSFT", "CME_MINI:NQ1!"],
  "withdateranges": false, "autosize": true
};

function AdvancedChartWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  useTradingViewWidget({
    widgetScriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js",
    widgetConfig,
    containerRef
  });

  return (
    <div className="tradingview-widget-container" ref={containerRef} style={{ height: "100%", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
    </div>
  );
}

export default React.memo(AdvancedChartWidget);
