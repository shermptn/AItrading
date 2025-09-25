import { useEffect, useRef } from 'react';

// Make TradingView available on the window object
declare global {
  interface Window {
    TradingView: any;
  }
}

export default function MainChart({ symbol }: { symbol: string }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChart = () => {
      if (!container.current || !window.TradingView) return;
      container.current.innerHTML = "";
      new window.TradingView.widget({
        symbol: symbol,
        interval: "60", // 1 hour
        container: container.current,
        autosize: true,
        theme: "dark",
        style: "1",
        timezone: "Etc/UTC",
        toolbar_bg: "#1e293b",
        withdateranges: true,
        allow_symbol_change: false,
        hide_side_toolbar: false,
      });
    };

    if (!window.TradingView) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = initChart;
      document.body.appendChild(script);
    } else {
      initChart();
    }
  }, [symbol]);

  return <div className="h-[520px] w-full rounded-xl overflow-hidden bg-neutral-900" ref={container} />;
}
