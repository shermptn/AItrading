import { useEffect, useRef } from 'react';

declare global { interface Window { TradingView: any; } }

export default function MainChart({ symbol }: { symbol: string }) {
  const container = useRef<HTMLDivElement>(null);
  const isScriptAppended = useRef(false);

  useEffect(() => {
    const initChart = () => {
      if (!container.current || !window.TradingView) return;
      container.current.innerHTML = ""; // Clear previous widget
      new window.TradingView.widget({
        symbol: symbol,
        interval: "60",
        container: container.current,
        autosize: true,
        theme: "dark",
        style: "1",
        timezone: "Etc/UTC",
        hide_side_toolbar: false,
        details: true,
      });
    };

    if (!window.TradingView && !isScriptAppended.current) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = initChart;
      document.body.appendChild(script);
      isScriptAppended.current = true;
    } else {
      initChart();
    }
  }, [symbol]);

  return <div className="h-[520px] w-full rounded-xl overflow-hidden bg-neutral-900" ref={container} />;
}
