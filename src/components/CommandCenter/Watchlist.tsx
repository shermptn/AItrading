import { useEffect, useRef } from 'react';

export default function Watchlist() {
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
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js';
    script.type = 'text/javascript';
    script.async = true;
    script.textContent = JSON.stringify({
      width: '100%',
      height: 500,
      symbolsGroups: [
        {
          name: 'US Stocks',
          symbols: [
            { name: 'NASDAQ:AAPL', displayName: 'AAPL' },
            { name: 'NASDAQ:MSFT', displayName: 'MSFT' },
            { name: 'NASDAQ:GOOGL', displayName: 'GOOGL' },
            { name: 'NASDAQ:AMZN', displayName: 'AMZN' },
            { name: 'NASDAQ:META', displayName: 'META' },
            { name: 'NASDAQ:NVDA', displayName: 'NVDA' },
            { name: 'NASDAQ:TSLA', displayName: 'TSLA' },
            { name: 'NASDAQ:QQQ', displayName: 'QQQ' },
            { name: 'AMEX:SPY', displayName: 'SPY' }
          ]
        }
      ],
      showSymbolLogo: true,
      colorTheme: 'dark',
      isTransparent: false,
      locale: 'en'
    });
    node.appendChild(script);

    return () => {
      if (node) safeClear(node);
    };
  }, []);

  return (
    <div className="bg-neutral-900 rounded-lg p-4 h-full">
      <h2 className="text-lg font-semibold mb-3 text-white">Watchlist</h2>
      <div ref={container} />
    </div>
  );
}
