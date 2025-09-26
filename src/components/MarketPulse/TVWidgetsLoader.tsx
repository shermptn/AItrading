import { useEffect, useRef } from 'react';

interface Props {
  initialSymbol: string;
}

export default function TVWidgetsLoader({ initialSymbol }: Props) {
  const containers = {
    ticker: useRef<HTMLDivElement>(null),
    advancedChart: useRef<HTMLDivElement>(null),
    overview: useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    const injectWidget = (container: HTMLDivElement, src: string, config: any) => {
      const script = document.createElement('script');
      script.src = src;
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = JSON.stringify(config);
      container.appendChild(script);
    };

    if (containers.ticker.current) {
      containers.ticker.current.innerHTML = '';
      injectWidget(
        containers.ticker.current,
        'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js',
        {
          symbols: [
            { proName: 'NASDAQ:AAPL', title: 'AAPL' },
            { proName: 'NASDAQ:MSFT', title: 'MSFT' },
            { proName: 'NASDAQ:GOOGL', title: 'GOOGL' },
          ],
          showSymbolLogo: true,
          isTransparent: false,
          colorTheme: 'dark',
          displayMode: 'adaptive',
        }
      );
    }

    if (containers.advancedChart.current) {
      containers.advancedChart.current.innerHTML = '';
      injectWidget(
        containers.advancedChart.current,
        'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js',
        {
          symbol: initialSymbol,
          colorTheme: 'dark',
          autosize: true,
        }
      );
    }

    if (containers.overview.current) {
      containers.overview.current.innerHTML = '';
      injectWidget(
        containers.overview.current,
        'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js',
        {
          tabs: [
            {
              title: 'Indices',
              symbols: [
                { s: 'FOREXCOM:SPXUSD', d: 'S&P 500' },
                { s: 'FOREXCOM:NSXUSD', d: 'Nasdaq 100' },
              ],
            },
          ],
          colorTheme: 'dark',
          width: '100%',
          height: 500,
        }
      );
    }
  }, [initialSymbol]);

  return (
    <div className="space-y-6">
      <div ref={containers.ticker} />
      <div ref={containers.advancedChart} />
      <div ref={containers.overview} />
    </div>
  );
}
