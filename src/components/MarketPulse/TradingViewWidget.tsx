import { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  widgetSrc: string;
  widgetConfig: object;
  height?: number | string;
}

export default function TradingViewWidget({ widgetSrc, widgetConfig, height = 400 }: TradingViewWidgetProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = '';
    const script = document.createElement('script');
    script.src = widgetSrc;
    script.async = true;
    script.innerHTML = JSON.stringify(widgetConfig);
    container.current.appendChild(script);
  }, [widgetSrc, widgetConfig]);

  return (
    <div
      ref={container}
      style={{ minHeight: typeof height === 'number' ? `${height}px` : height }}
      className="tradingview-widget-container bg-neutral-900 rounded-lg p-4"
    />
  );
}
