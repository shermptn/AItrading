import { useEffect, useRef } from 'react';

export default function TradingViewTicker() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    
    // Clear any existing content
    container.current.innerHTML = '';
    
    // Create the widget script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.type = 'text/javascript';
    script.async = true;
    
    // Configure the widget
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: 'NASDAQ:AAPL', title: 'AAPL' },
        { proName: 'NASDAQ:MSFT', title: 'MSFT' },
        { proName: 'NASDAQ:GOOGL', title: 'GOOGL' },
        { proName: 'NASDAQ:AMZN', title: 'AMZN' },
        { proName: 'NASDAQ:META', title: 'META' },
        { proName: 'NASDAQ:NVDA', title: 'NVDA' },
        { proName: 'NASDAQ:TSLA', title: 'TSLA' },
        { proName: 'NASDAQ:QQQ', title: 'QQQ' },
        { proName: 'AMEX:SPY', title: 'SPY' }
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: 'adaptive',
      colorTheme: 'dark',
      locale: 'en'
    });

    // Add the script to the container
    container.current.appendChild(script);

    // Cleanup on unmount
    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}
