import { useEffect, useRef, useCallback } from 'react';
import { createChart, ColorType, IChartApi, UTCTimestamp } from 'lightweight-charts';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../api/client';

interface Bar {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

function useCandleData(symbol: string) {
  return useQuery<{ values: any[] }, Error>({
    queryKey: ['timeseries', symbol],
    queryFn: async () => {
      // Fetch 250 daily bars for the symbol with longer timeout for data requests
      const res = await apiGet<any>('timeseries', { symbol, interval: '1day', limit: '250' }, {
        timeout: 30000,
        maxRetries: 2
      });
      return res;
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx)
      if (error.message.includes('400') || error.message.includes('404')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

function transformData(raw: any[]): Bar[] {
  if (!Array.isArray(raw)) return [];
  
  return raw
    .filter(bar => bar && bar.datetime && bar.open && bar.high && bar.low && bar.close)
    .map((bar) => {
      try {
        return {
          time: Math.floor(new Date(bar.datetime).getTime() / 1000) as UTCTimestamp,
          open: parseFloat(bar.open),
          high: parseFloat(bar.high),
          low: parseFloat(bar.low),
          close: parseFloat(bar.close),
          volume: parseFloat(bar.volume || '0'),
        };
      } catch (error) {
        console.warn('Failed to transform bar data:', bar, error);
        return null;
      }
    })
    .filter((bar): bar is Bar => bar !== null)
    .reverse(); // Twelve Data is newest first, chart wants oldest first
}

export default function MainChart({ symbol }: { symbol: string }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const { data, isLoading, error, refetch } = useCandleData(symbol);

  // Memoized resize handler
  const handleResize = useCallback(() => {
    if (chartRef.current && chartContainerRef.current) {
      const rect = chartContainerRef.current.getBoundingClientRect();
      chartRef.current.resize(rect.width, 500);
    }
  }, []);

  // Set up chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clean up existing chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    // Clean up existing resize observer
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }

    try {
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 500,
        layout: {
          background: { type: ColorType.Solid, color: '#171717' },
          textColor: '#e5e5e5',
        },
        grid: {
          vertLines: { color: '#222' },
          horzLines: { color: '#222' },
        },
        rightPriceScale: {
          borderColor: '#444',
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
        },
        timeScale: {
          borderColor: '#444',
          timeVisible: true,
          secondsVisible: false,
        },
        crosshair: {
          mode: 0,
        },
        handleScroll: {
          mouseWheel: true,
          pressedMouseMove: true,
        },
        handleScale: {
          axisPressedMouseMove: true,
          mouseWheel: true,
          pinch: true,
        },
      });

      chartRef.current = chart;

      const candleSeries = chart.addCandlestickSeries({
        upColor: '#16a34a',
        downColor: '#dc2626',
        borderUpColor: '#16a34a',
        borderDownColor: '#dc2626',
        wickUpColor: '#16a34a',
        wickDownColor: '#dc2626',
      });

      // Set up responsive chart with ResizeObserver
      if (window.ResizeObserver) {
        resizeObserverRef.current = new ResizeObserver(handleResize);
        resizeObserverRef.current.observe(chartContainerRef.current);
      } else {
        // Fallback to window resize event
        window.addEventListener('resize', handleResize);
      }

    } catch (error) {
      console.error('Failed to create chart:', error);
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      } else {
        window.removeEventListener('resize', handleResize);
      }
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [symbol, handleResize]);

  // Set data whenever it changes
  useEffect(() => {
    if (!chartRef.current || !data?.values) return;

    try {
      const bars = transformData(data.values);
      const series = chartRef.current.getSeries();
      
      if (series.length > 0 && bars.length > 0) {
        const candleSeries = series[0] as any;
        candleSeries.setData(bars);
        
        // Auto-fit the chart to show all data
        chartRef.current.timeScale().fitContent();
      }
    } catch (error) {
      console.error('Failed to set chart data:', error);
    }
  }, [data]);

  const handleRetry = () => {
    refetch();
  };

  return (
    <div className="bg-neutral-900 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-neutral-700">
        <h3 className="text-lg font-semibold text-white">Price Chart - {symbol}</h3>
      </div>
      
      <div
        ref={chartContainerRef}
        className="h-[500px] w-full relative"
        style={{ minHeight: 400, minWidth: 320 }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/80">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <div className="text-neutral-400">Loading chart data...</div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/80">
            <div className="text-center p-6">
              <div className="text-red-400 mb-4">
                <div className="text-lg font-semibold mb-2">Failed to load chart</div>
                <div className="text-sm">{error.message}</div>
              </div>
              <button
                onClick={handleRetry}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
        {!isLoading && !error && (!data?.values || data.values.length === 0) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-neutral-400 p-6">
              <div className="text-lg mb-2">No chart data available</div>
              <div className="text-sm">Data may not be available for this symbol</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
