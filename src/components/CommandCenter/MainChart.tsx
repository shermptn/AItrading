import { useEffect, useRef, useState } from 'react';

declare global { 
  interface Window { TradingView: any; } 
}

export default function MainChart({ symbol }: { symbol: string }) {
  const container = useRef<HTMLDivElement>(null);
  const isScriptAppended = useRef(false);
  const [tvError, setTvError] = useState(false);

  useEffect(() => {
    let widget: any;
    setTvError(false);
    const initChart = () => {
      if (!container.current || !window.TradingView) return setTvError(true);
      container.current.innerHTML = "";
      try {
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
      } catch {
        setTvError(true);
      }
    };

    if (!window.TradingView && !isScriptAppended.current) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = initChart;
      script.onerror = () => setTvError(true);
      document.body.appendChild(script);
      isScriptAppended.current = true;
    } else {
      initChart();
    }

    return () => {
      if (container.current) container.current.innerHTML = "";
    };
  }, [symbol]);

  if (tvError) {
    return <div className="text-red-400 text-center p-4">Failed to load TradingView chart. Try disabling your adblocker or check your internet connection.</div>;
  }
  return <div className="h-[520px] w-full rounded-xl overflow-hidden bg-neutral-900" ref={container} />;
}
