import { useEffect, useRef } from 'react';
import type { IChartApi, UTCTimestamp } from 'lightweight-charts'; // types only
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
      const res = await apiGet<any>('timeseries', { symbol, interval: '1day', limit: '250' });
      return res;
    },
    staleTime: 1000 * 60 * 10,
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    retry: 1,
  });
}

function transformData(raw: any[]): Bar[] {
  return raw
    .map((bar) => ({
      time: Math.floor(new Date(bar.datetime).getTime() / 1000) as UTCTimestamp,
      open: parseFloat(bar.open),
      high: parseFloat(bar.high),
      low: parseFloat(bar.low),
      close: parseFloat(bar.close),
      volume: parseFloat(bar.volume ?? 0),
    }))
    .reverse();
}

export default function MainChart({ symbol }: { symbol: string }) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);
  const { data, isLoading, error } = useCandleData(symbol);

  // local cache key
  const cacheKey = `timeseries:${symbol}`;

  // Persist data for fallback
  useEffect(() => {
    if (data?.values) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(data.values));
      } catch {
        /* ignore */
      }
    }
  }, [data, cacheKey]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // remove previous chart defensively
    if (chartRef.current) {
      try {
        chartRef.current.remove();
      } catch (e) {
        console.warn('Error removing previous chart:', e);
      }
      chartRef.current = null;
      seriesRef.current = null;
    }

    let mounted = true;

    (async () => {
      try {
        const module = await import('lightweight-charts');
        if (!mounted || !chartContainerRef.current) return;

        console.debug('lightweight-charts module keys:', Object.keys(module));
        const { createChart, ColorType } = module;

        const chart = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: 500,
          layout: { background: { type: ColorType.Solid, color: '#171717' }, textColor: '#e5e5e5' },
          grid: { vertLines: { color: '#222' }, horzLines: { color: '#222' } },
          rightPriceScale: { borderColor: '#444' },
          timeScale: { borderColor: '#444' },
          crosshair: { mode: 0 },
        });

        console.debug('chart instance keys:', Object.keys(chart as any));
        chartRef.current = chart;

        // create series defensively and log if neither method exists
        if (typeof (chart as any).addCandlestickSeries === 'function') {
          seriesRef.current = (chart as any).addCandlestickSeries({
            upColor: '#16a34a',
            downColor: '#dc2626',
            borderUpColor: '#16a34a',
            borderDownColor: '#dc2626',
            wickUpColor: '#16a34a',
            wickDownColor: '#dc2626',
          });
        } else if (typeof (chart as any).addLineSeries === 'function') {
          console.warn('addCandlestickSeries missing, falling back to addLineSeries');
          seriesRef.current = (chart as any).addLineSeries();
        } else {
          // Log the issue so you can inspect in console
          console.error('Chart instance does not support candlestick or line series. Chart keys:', Object.keys(chart as any));
          // Show a friendly UI instead of throwing
          if (chartContainerRef.current) {
            chartContainerRef.current.innerHTML =
              '<div style="padding:18px;color:#f87171;text-align:center;">Chart API unavailable in this build. Ensure lightweight-charts v5.x is installed and bundled.</div>';
          }
          return;
        }

        // populate cached data if available immediately
        try {
          const raw = localStorage.getItem(cacheKey);
          if (raw && seriesRef.current) {
            const cached = JSON.parse(raw);
            const bars = transformData(cached);
            if (typeof seriesRef.current.setData === 'function') seriesRef.current.setData(bars);
          }
        } catch {
          /* ignore */
        }

        // handle resizing
        const handleResize = () => {
          if (chartContainerRef.current && chartRef.current) {
            try {
              chartRef.current.resize(chartContainerRef.current.clientWidth, 500);
            } catch {
              /* ignore */
            }
          }
        };
        window.addEventListener('resize', handleResize);
        (chart as any).__cleanup = () => window.removeEventListener('resize', handleResize);
      } catch (err) {
        console.error('Error initializing chart:', err);
        if (chartContainerRef.current) {
          chartContainerRef.current.innerHTML =
            '<div style="padding:18px;color:#f87171;text-align:center;">Chart failed to initialize.</div>';
        }
      }
    })();

    return () => {
      mounted = false;
      try {
        if (chartRef.current) {
          try {
            (chartRef.current as any).__cleanup?.();
          } catch {}
          chartRef.current.remove();
        }
      } catch {
        /* ignore */
      } finally {
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, [symbol]);

  // set new data
  useEffect(() => {
    if (seriesRef.current && data?.values) {
      try {
        const bars = transformData(data.values);
        if (typeof seriesRef.current.setData === 'function') seriesRef.current.setData(bars);
        else if (typeof seriesRef.current.update === 'function') bars.forEach((b) => seriesRef.current.update(b));
      } catch (err) {
        console.error('Failed to set chart data:', err);
      }
    }
  }, [data]);

  // quota UI
  if (error && (error as any).code === 'quota_exceeded') {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw && raw.length) {
        return (
          <div ref={chartContainerRef} className="h-[520px] w-full rounded-xl overflow-hidden bg-neutral-900" style={{ minHeight: 400, minWidth: 320 }}>
            <div className="text-amber-300 text-center pt-4">Using last known cached data (provider quota exhausted).</div>
          </div>
        );
      }
    } catch {
      /* ignore */
    }
    return (
      <div ref={chartContainerRef} className="h-[520px] w-full rounded-xl overflow-hidden bg-neutral-900" style={{ minHeight: 400, minWidth: 320 }}>
        <div className="text-center text-red-400 pt-40">API credits exhausted for today. Please try again later or upgrade the data plan.</div>
      </div>
    );
  }

  return (
    <div ref={chartContainerRef} className="h-[520px] w-full rounded-xl overflow-hidden bg-neutral-900" style={{ minHeight: 400, minWidth: 320 }}>
      {isLoading && <div className="text-center text-neutral-400 pt-40">Loading chart...</div>}
      {error && <div className="text-red-400 text-center pt-40">Failed to load chart: {error.message}</div>}
      {!isLoading && !error && (!data?.values || data.values.length === 0) && <div className="text-neutral-400 text-center pt-40">No chart data available.</div>}
    </div>
  );
}
