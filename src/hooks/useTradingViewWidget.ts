import { useEffect, useState, RefObject } from 'react';

interface UseTradingViewWidgetOptions {
  widgetScriptSrc: string;
  widgetConfig: object;
  containerRef: RefObject<HTMLDivElement>;
}

export function useTradingViewWidget({
  widgetScriptSrc,
  widgetConfig,
  containerRef,
}: UseTradingViewWidgetOptions) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    containerRef.current.innerHTML = '';
    setIsLoading(true);
    setError(null);

    const script = document.createElement('script');
    script.src = widgetScriptSrc;
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify(widgetConfig);

    script.onload = () => {
      setIsLoading(false);
    };

    script.onerror = () => {
      setIsLoading(false);
      setError('Failed to load the TradingView widget script.');
    };

    containerRef.current.appendChild(script);

    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setError('Widget loading timed out.');
        setIsLoading(false);
      }
    }, 15000);

    return () => {
      clearTimeout(timeoutId);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [widgetScriptSrc, JSON.stringify(widgetConfig), containerRef]);

  return { isLoading, error };
}
