import { useEffect, useRef, useState } from 'react';

export default function HeatmapWidget() {
  const container = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const loadWidget = () => {
    if (!container.current) return;
    
    setIsLoading(true);
    setError(null);

    try {
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

      // Add error handling for script loading
      script.onload = () => {
        setIsLoading(false);
        setError(null);
        setRetryCount(0);
      };

      script.onerror = () => {
        setIsLoading(false);
        setError('Failed to load TradingView widget');
        console.error('TradingView heatmap widget failed to load');
      };

      container.current.appendChild(script);

      // Set a timeout to detect if the widget doesn't load
      const timeoutId = setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
          setError('Widget loading timeout - check your internet connection');
        }
      }, 15000);

      return () => {
        clearTimeout(timeoutId);
        if (container.current) {
          container.current.innerHTML = '';
        }
      };
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error initializing heatmap widget:', err);
    }
  };

  useEffect(() => {
    const cleanup = loadWidget();
    return cleanup;
  }, [retryCount]);

  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
    }
  };

  return (
    <div className="bg-neutral-900 rounded-lg p-4 h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">S&P 500 Sector Heatmap</h3>
        {error && retryCount < 3 && (
          <button
            onClick={handleRetry}
            className="text-xs bg-red-700 hover:bg-red-600 text-white px-2 py-1 rounded transition-colors"
          >
            Retry
          </button>
        )}
      </div>
      
      <div className="h-[calc(100%-3rem)] relative" ref={container}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-800 rounded">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <div className="text-neutral-400">Loading market heatmap...</div>
              <div className="text-xs text-neutral-500 mt-1">Powered by TradingView</div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-800 rounded">
            <div className="text-center p-6">
              <div className="text-red-400 mb-4">
                <div className="text-lg font-semibold mb-2">Widget Failed to Load</div>
                <div className="text-sm">{error}</div>
              </div>
              {retryCount < 3 ? (
                <button
                  onClick={handleRetry}
                  className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
                >
                  Retry ({retryCount + 1}/3)
                </button>
              ) : (
                <div className="text-xs text-neutral-400">
                  Maximum retry attempts reached. Please refresh the page.
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="tradingview-widget-container__widget h-full"></div>
      </div>
    </div>
  );
}
