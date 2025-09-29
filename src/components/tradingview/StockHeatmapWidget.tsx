import React, { useEffect, useRef, memo } from 'react';

function StockHeatmapWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  // Use a ref to ensure the script is only created once, even if the component re-renders.
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    // Check if the container is rendered and the script hasn't been created yet.
    if (containerRef.current && !scriptRef.current) {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js';
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = `
        {
          "exchanges": [],
          "dataSource": "SPX500",
          "grouping": "sector",
          "themes": [
            "dark",
            "light"
          ],
          "frameColor": "rgba(0, 0, 0, 1)",
          "width": "100%",
          "height": "100%",
          "locale": "en"
        }`;
      
      // Append the script to the container and store a reference to it.
      containerRef.current.appendChild(script);
      scriptRef.current = script;
    }

    // No cleanup function is needed here for simple widgets, as the script handles its own lifecycle.
    // The empty dependency array [] ensures this effect runs only once after the initial render.
  }, []);

  // Set a specific class and the ref for the script to target.
  return <div className="tradingview-widget-container" ref={containerRef} style={{ height: '100%', width: '100%' }}></div>;
}

// Use memo to prevent unnecessary re-renders of this static widget.
export default memo(StockHeatmapWidget);
