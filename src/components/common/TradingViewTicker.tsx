import { useEffect, useRef } from 'react';

export default function TradingViewTicker() {
  const container = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = container.current;
    if (!node) return;

    const safeClear = (n: HTMLElement) => {
      try {
        while (n.firstChild) {
          if (n.contains(n.firstChild)) n.removeChild(n.firstChild);
          else break;
        }
      } catch {
        try {
          n.innerHTML = '';
        } catch {}
      }
    };

    safeClear(node);

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
    node.appendChild(script);

    return () => {
      if (node) safeClear(node);
    };
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}
