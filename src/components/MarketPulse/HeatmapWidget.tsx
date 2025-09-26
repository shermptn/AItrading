import { useEffect, useRef } from 'react';

export default function HeatmapWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    
    container.current.innerHTML = '';
    const script = document.createElement('script');
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      exchanges: ["NASDAQ"],
      dataSource: "SPX500",
      grouping: "sector",
      blockSize: "market_cap_basic",
      blockColor: "change",
      locale: "en",
      symbolUrl: "",
      colorTheme: "dark",
      hasVolume: true,
      width: "100%",
      height: "100%"
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="bg-neutral-900 rounded-lg p-4 h-full">
      <h3 className="text-lg font-semibold mb-3 text-white">S&P 500 Sector Heatmap</h3>
      <div className="h-[calc(100%-3rem)]" ref={container}>
        <div className="tradingview-widget-container__widget"></div>
      </div>
    </div>
  );
}
