import { useEffect, useRef } from 'react';

/**
 * TradingViewTicker
 * Simple client-only component that injects TradingView's ticker-tape widget.
 * Place it where you want the scrolling ticker to appear.
 */
export default function TradingViewTicker() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any previous content (HMR / re-mount safety)
    containerRef.current.innerHTML = '';

    const symbols = [
      { proName: 'NASDAQ:AAPL', title: 'AAPL' },
      { proName: 'NASDAQ:MSFT', title: 'MSFT' },
      { proName: 'NASDAQ:GOOGL', title: 'GOOGL' },
      { proName: 'NASDAQ:AMZN', title: 'AMZN' },
      { proName: 'NASDAQ:META', title: 'META' },
      { proName: 'NASDAQ:NVDA', title: 'NVDA' },
      { proName: 'NASDAQ:TSLA', title: 'TSLA' },
      { proName: 'NASDAQ:QQQ', title: 'QQQ' },
      { proName: 'AMEX:SPY', title: 'SPY' }
    ];

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.text = JSON.stringify({
      symbols,
      showSymbolLogo: true,
      isTransparent: true,
      largeChartUrl: '',
      displayMode: 'adaptive',
      colorTheme: 'dark',
      locale: 'en'
    });

    // wrapper div expected by TradingView embed
    const inner = document.createElement('div');
    inner.className = 'tradingview-widget-container__widget';
    containerRef.current.appendChild(inner);
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="mx-auto mt-4 rounded-md overflow-hidden"
      style={{ maxWidth: 1040, height: 44 }}
      id="tv-ticker-home"
    />
  );
}
