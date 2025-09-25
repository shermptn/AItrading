import { useEffect, useRef } from 'react';

declare global { 
  interface Window { TradingView: any; } 
}

export default function MainChart({ symbol }: { symbol: string }) {
  const container = useRef<HTMLDivElement>(null);
  const isScriptAppended = useRef(false);

  useEffect(() => {
    let widget: any;
    const initChart = () => {
      if (!container.current || !window.TradingView) return;
      container.current.innerHTML = "";
      widget = new window.TradingView.widget({
        symbol,
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

    // 🔴 Add cleanup to prevent widgets stacking
    return () => {
      if (container.current) container.current.innerHTML = "";
      // If TradingView exposes a destroy method, call it here (not always needed)
    };
  }, [symbol]);

  return <div className="h-[520px] w-full rounded-xl overflow-hidden bg-neutral-900" ref={container} />;
}
useEffect(() => {
  let widget: any;
  // ...existing code...
  return () => {
    if (container.current) container.current.innerHTML = "";
    // Optionally, if TradingView provides a destroy method, call it on widget here
  };
}, [symbol]);
