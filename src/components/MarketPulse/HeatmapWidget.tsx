import { useEffect, useRef } from 'react';

declare global {
  interface Window { TradingView: any; }
}

export default function HeatmapWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "exchanges": [],
      "dataSource": "SPX500",
      "grouping": "sector",
      "blockSize": "market_cap_basic",
      "blockColor": "change",
      "locale": "en",
      "symbolUrl": "",
      "colorTheme": "dark",
      "hasTopBar": false,
      "isDataSetEnabled": false,
      "isZoomEnabled": true,
      "hasSymbolColumn": false,
      "width": "100%",
      "height": "100%"
    });

    container.current.appendChild(script);

    return () => {
        if(container.current) {
            container.current.innerHTML = "";
        }
    }
  }, []);

  return (
    <div className="bg-neutral-900 rounded-lg p-4 h-[400px] lg:h-full">
      <h3 className="text-lg font-semibold mb-3 text-white">S&P 500 Sector Heatmap</h3>
      <div className="h-[calc(100%-3rem)]" ref={container} />
    </div>
  );
}
