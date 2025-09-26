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
    // Ensure the container is available
    if (!containerRef.current) {
      return;
    }

    // Clear the container on re-render to avoid duplicating widgets
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
      setError('Failed to load the TradingView widget script. Please check your network or ad-blocker settings.');
    };

    containerRef.current.appendChild(script);

    // Set a timeout to catch cases where the script loads but the widget doesn't render
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setError('Widget loading timed out.');
        setIsLoading(false);
      }
    }, 15000); // 15-second timeout

    // Cleanup function to remove the script and clear timeout
    return () => {
      clearTimeout(timeoutId);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [widgetScriptSrc, JSON.stringify(widgetConfig), containerRef]); // Re-run if config changes

  return { isLoading, error };
}
