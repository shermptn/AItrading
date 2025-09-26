import React, { useEffect, useRef, memo } from 'react';

function TickerTapeWidget() {
  const container = useRef();

  useEffect(
    () => {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = `
        {
          "symbols": [
            {
              "proName": "FOREXCOM:SPXUSD",
              "title": "S&P 500 Index"
            },
            {
              "proName": "FOREXCOM:NSXUSD",
              "title": "US 100 Cash CFD"
            },
            {
              "proName": "BITSTAMP:BTCUSD",
              "title": "Bitcoin"
            },
            {
              "proName": "BITSTAMP:ETHUSD",
              "title": "Ethereum"
            },
            {
              "proName": "NASDAQ:TSLA",
              "title": "TSLA"
            },
            {
              "proName": "NASDAQ:META",
              "title": "META"
            },
            {
              "proName": "NASDAQ:MSFT",
              "title": "MSFT"
            },
            {
              "proName": "NASDAQ:NDX",
              "title": "NDX"
            },
            {
              "proName": "OANDA:XAUUSD",
              "title": "GOLD"
            },
            {
              "proName": "NASDAQ:NVDA",
              "title": "NVIDIA"
            },
            {
              "proName": "NASDAQ:AAPL",
              "title": "AAPL"
            }
          ],
          "colorTheme": "dark",
          "locale": "en",
          "largeChartUrl": "",
          "isTransparent": false,
          "showSymbolLogo": true,
          "displayMode": "adaptive"
        }`;
      container.current.appendChild(script);
    },
    []
  );

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright"><a href="https://www.tradingview.com/markets/" rel="noopener nofollow" target="_blank"><span className="blue-text">Ticker tape</span></a><span className="trademark"> by TradingView</span></div>
    </div>
  );
}

export default memo(TickerTapeWidget);
