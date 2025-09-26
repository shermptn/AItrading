import { useEffect, useRef, useState } from 'react';

type WatchItem = { symbol: string; display: string; price: number };

// A small local fallback dataset (keeps UI usable when TradingView is blocked)
const FALLBACK_WATCHLIST: WatchItem[] = [
  { symbol: 'AAPL', display: 'AAPL', price: 256.6 },
  { symbol: 'MSFT', display: 'MSFT', price: 510.17 },
  { symbol: 'GOOGL', display: 'GOOGL', price: 246.66 },
  { symbol: 'AMZN', display: 'AMZN', price: 220.26 },
  { symbol: 'META', display: 'META', price: 742.6 },
  { symbol: 'NVDA', display: 'NVDA', price: 177.2 },
  { symbol: 'TSLA', display: 'TSLA', price: 438.61 },
  { symbol: 'QQQ', display: 'QQQ', price: 595.57 },
];

function safeClear(n: HTMLElement) {
  try {
    while (n.firstChild) {
      try {
        if (n.contains(n.firstChild)) n.removeChild(n.firstChild);
        else break;
      } catch {
        break;
      }
    }
  } catch {
    try {
      n.innerHTML = '';
    } catch {}
  }
}

export default function Watchlist() {
  const container = useRef<HTMLDivElement | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  const [items, setItems] = useState<WatchItem[]>(FALLBACK_WATCHLIST);

  useEffect(() => {
    const node = container.current;
    if (!node) return;

    // If a tradingview widget is already injected (prevent duplicates), skip injection
    const already = node.querySelector('[data-tv-injected]');
    if (already) {
      // give the widget a chance to render; if it doesn't show iframe quickly, fallback below
      const iframeCheck = setTimeout(() => {
        const iframe = node.querySelector('iframe');
        if (!iframe) setShowFallback(true);
      }, 2500);
      return () => clearTimeout(iframeCheck);
    }

    // Attempt injection
    safeClear(node);
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js';
    script.type = 'text/javascript';
    script.async = true;
    // set data attribute for detection/cleanup
    script.setAttribute('data-tv-injected', '1');
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

    // Poll for iframe for a short period; if not present, show fallback table
    let attempts = 0;
    const maxAttempts = 6;
    const interval = 600;
    const check = () => {
      attempts += 1;
      const iframe = node.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        setShowFallback(false);
        return;
      }
      if (attempts >= maxAttempts) {
        setShowFallback(true);
        return;
      }
      setTimeout(check, interval);
    };
    setTimeout(check, 400);

    return () => {
      // On unmount, only clear our own injected elements (by data-tv-injected), avoid removing other instances
      if (node) {
        try {
          const injected = node.querySelectorAll('[data-tv-injected]');
          injected.forEach((el) => {
            if (node.contains(el)) node.removeChild(el);
          });
        } catch {
          // fallback: attempt a safe clear
          safeClear(node);
        }
      }
    };
  }, []);

  // Simple fallback markup: accessible table
  const FallbackTable = () => (
    <div className="bg-neutral-900 rounded-lg p-2">
      <h3 className="text-sm font-semibold mb-2 text-white">Watchlist</h3>
      <div className="overflow-y-auto max-h-[420px]">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-400">
              <th className="p-2">Name</th>
              <th className="p-2 text-right">Value</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.symbol} className="border-b border-neutral-800 hover:bg-neutral-800">
                <td className="p-2">{it.display}</td>
                <td className="p-2 text-right">{it.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="bg-neutral-900 rounded-lg p-4 h-full">
      {showFallback ? <FallbackTable /> : <div ref={container} />}
    </div>
  );
}
