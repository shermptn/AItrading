import React, { useRef } from 'react';
import { useTradingViewWidget } from '../../hooks/useTradingViewWidget';

const widgetConfig = {
  "dataSource": "SPX500", "blockSize": "market_cap_basic", "blockColor": "change", "grouping": "sector",
  "locale": "en", "symbolUrl": "", "colorTheme": "dark", "hasTopBar": false, "isDataSetEnabled": false,
  "isZoomEnabled": true, "hasSymbolTooltip": true, "isMonoSize": false, "width": "100%", "height": "100%"
};

function StockHeatmapWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  useTradingViewWidget({
    widgetScriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js",
    widgetConfig,
    containerRef
  });

  return <div className="tradingview-widget-container" ref={containerRef} style={{ height: "100%", width: "100%" }}></div>;
}

export default React.memo(StockHeatmapWidget);
