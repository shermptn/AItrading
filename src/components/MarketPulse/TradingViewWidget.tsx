import { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  widgetSrc: string;
  widgetConfig: object;
  height?: number | string;
}

/**
 * TradingViewWidget
 * - Dynamically injects any TradingView widget script into a container.
 * - Shows a fallback message if the widget is blocked by adblockers/privacy settings.
 * - Accepts widgetSrc (script URL), widgetConfig (object), and height (px or string).
 */
export default function TradingViewWidget({
  widgetSrc,
  widgetConfig,
  height = 400,
}: TradingViewWidgetProps) {
  const container = useRef<HTMLDivElement>(null);

  // Fallback error state
  function showFallback() {
    if (container.current) {
      container.current.innerHTML = `
        <div style="padding:18px;text-align:center;color:#fbbf24;">
          <strong>TradingView widget failed to load.</strong><br/>
          If you use an adblocker or privacy browser, allow scripts from <b>s3.tradingview.com</b> and refresh.<br/>
          <button id="tv-retry-btn" style="margin-top:10px;padding:6px 14px;background:#fde68a;color:#222;border-radius:6px;border:none;cursor:pointer;">Retry</button>
        </div>
      `;
      const btn = container.current.querySelector('#tv-retry-btn');
      if (btn) btn.addEventListener('click', injectScript);
    }
  }

  // Script injection logic
  function injectScript() {
    if (!container.current) return;
    container.current.innerHTML = '';
    const widget = document.createElement('div');
    widget.className = 'tradingview-widget-container__widget';
    container.current.appendChild(widget);

    const script = document.createElement('script');
    script.src = widgetSrc;
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify(widgetConfig);
    container.current.appendChild(script);

    setTimeout(() => {
      const hasWidget = !!container.current?.querySelector('iframe');
      if (!hasWidget) showFallback();
    }, 2500);
  }

  useEffect(() => {
    injectScript();
    return () => {
      if (container.current) container.current.innerHTML = '';
    };
    // eslint-disable-next-line
  }, [widgetSrc, JSON.stringify(widgetConfig)]);

  return (
    <div
      ref={container}
      className="tradingview-widget-container bg-neutral-900 rounded-lg p-4"
      style={{ minHeight: typeof height === 'number' ? `${height}px` : height }}
    />
  );
}
