import { useEffect, useRef } from 'react';

export default function TradingViewTicker() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    try {
      container.current.innerHTML = '';
    } catch (e) {
      console.warn('Failed to clear tradingview ticker container:', e);
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.type = 'text/javascript';
    script.async = true;
    script.textContent = JSON.stringify({
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
    container.current.appendChild(script);

    return () => {
      if (container.current) {
        try {
          container.current.innerHTML = '';
        } catch (e) {
          console.warn('Failed to clear tradingview ticker container on unmount:', e);
        }
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}
