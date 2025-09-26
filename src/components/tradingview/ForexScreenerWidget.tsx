import React, { useRef } from 'react';
import { useTradingViewWidget } from '../../hooks/useTradingViewWidget';

const widgetConfig = {
  "displayMode": "regular", "feedMode": "all_symbols", "colorTheme": "dark", "isTransparent": false,
  "locale": "en", "width": "100%", "height": "100%"
};

function TimelineWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  useTradingViewWidget({
    widgetScriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js",
    widgetConfig,
    containerRef
  });

  return <div className="tradingview-widget-container" ref={containerRef} style={{ height: "100%", width: "100%" }}></div>;
}

export default React.memo(TimelineWidget);
