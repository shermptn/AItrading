import React, { useRef } from 'react';
import { useTradingViewWidget } from '../../hooks/useTradingViewWidget';

const widgetConfig = {
  "colorTheme": "dark", "isTransparent": false, "locale": "en", "countryFilter": "us,ca",
  "importanceFilter": "-1,0,1", "width": "100%", "height": "100%"
};

function EconomicCalendarWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  useTradingViewWidget({
    widgetScriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-events.js",
    widgetConfig,
    containerRef
  });

  return <div className="tradingview-widget-container" ref={containerRef} style={{ height: "100%", width: "100%" }}></div>;
}

export default React.memo(EconomicCalendarWidget);
