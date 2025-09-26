import React, { useEffect, useRef, memo } from 'react';

function EconomicCalendarWidget() {
  const container = useRef();

  useEffect(
    () => {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = `
        {
          "colorTheme": "dark",
          "isTransparent": false,
          "locale": "en",
          "countryFilter": "us,ca",
          "importanceFilter": "-1,0,1",
          "width": 400,
          "height": 550
        }`;
      container.current.appendChild(script);
    },
    []
  );

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright"><a href="https://www.tradingview.com/economic-calendar/" rel="noopener nofollow" target="_blank"><span className="blue-text">Economic Calendar</span></a><span className="trademark"> by TradingView</span></div>
    </div>
  );
}

export default memo(EconomicCalendarWidget);
