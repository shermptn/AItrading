import React, { useRef } from 'react';
import { useTradingViewWidget } from '../../hooks/useTradingViewWidget';

const widgetConfig = {
  "dataSource": "Crypto", "blockSize": "market_cap_calc", "blockColor": "24h_close_change|5", "locale": "en",
  "symbolUrl": "", "colorTheme": "dark", "hasTopBar": false, "isDataSetEnabled": false, "isZoomEnabled": true,
  "hasSymbolTooltip": true, "isMonoSize": false, "width": "100%", "height": "100%"
};

function CryptoHeatmapWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  useTradingViewWidget({
    widgetScriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js",
    widgetConfig,
    containerRef
  });

  return <div className="tradingview-widget-container" ref={containerRef} style={{ height: "100%", width: "100%" }}></div>;
}

export default React.memo(CryptoHeatmapWidget);
