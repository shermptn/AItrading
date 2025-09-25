import { useEffect, useRef } from 'react';

// This lets TypeScript know that the TradingView object will be available on the window
declare global { 
  interface Window { TradingView: any; } 
}

export default function MainChart({ symbol }: { symbol: string }) {
  const container = useRef<HTMLDivElement>(null);
  const isScriptAppended = useRef(false);

  useEffect(() => {
    // This function initializes the TradingView widget
    const initChart = () => {
      if (!container.current || !window.TradingView) return;
      container.current.innerHTML = ""; // Clear any previous widget
      new window.TradingView.widget({
        symbol: symbol,
        interval: "60", // 1 hour
        container: container.current,
        autosize: true,
        theme: "dark",
        style: "1",
        timezone: "Etc/UTC",
        hide_side_toolbar: false,
        details: true,
      });
    };

    // This logic ensures the main TradingView script is loaded only once
    if (!window.TradingView && !isScriptAppended.current) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = initChart; // Initialize the chart after the script loads
      document.body.appendChild(script);
      isScriptAppended.current = true;
    } else {
      initChart(); // Initialize immediately if script is already loaded
    }
  }, [symbol]); // Re-run this effect whenever the symbol changes

  return <div className="h-[520px] w-full rounded-xl overflow-hidden bg-neutral-900" ref={container} />;
}
