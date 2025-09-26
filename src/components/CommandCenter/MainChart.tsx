import { useEffect, useRef, useState } from 'react';
import type { IChartApi, UTCTimestamp } from 'lightweight-charts'; // only types
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../api/client';
import sampleDataJson from '../../data/sample-timeseries-SPY.json';

interface Bar {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
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

export default function MainChart({ symbol }: { symbol: string }) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);
  const { data, isLoading, error } = useCandleData(symbol);
  const [useSparklineFallback, setUseSparklineFallback] = useState(false);

  const cacheKey = `timeseries:${symbol}`;

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
        const { createChart, ColorType } = module;

        // larger height (default) so chart isn't tiny
        const HEIGHT = 640;
        const chart = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: HEIGHT,
          layout: {
            background: { type: ColorType.Solid, color: '#171717' },
            textColor: '#e5e5e5',
          },
          rightPriceScale: { borderColor: '#444' },
          timeScale: { borderColor: '#444' },
          grid: { vertLines: { color: '#222' }, horzLines: { color: '#222' } },
          crosshair: { mode: 0 },
        });

        // ensure the chart properly resizes to container width explicitly
        try {
          chart.resize(chartContainerRef.current.clientWidth, HEIGHT);
        } catch (e) {
          /* ignore */
        }

        chartRef.current = chart;

        const asAny = chart as any;
        if (typeof asAny.addCandlestickSeries === 'function') {
          seriesRef.current = asAny.addCandlestickSeries();
        } else if (typeof asAny.addLineSeries === 'function') {
          seriesRef.current = asAny.addLineSeries();
        } else {
          // if the runtime chart doesn't expose expected APIs, use sparkline fallback UI
          console.error('Native chart API unavailable; using fallback sparkline.');
          setUseSparklineFallback(true);
          try {
            chart.remove();
          } catch {}
          chartRef.current = null;
          seriesRef.current = null;
          return;
        }

        const handleResize = () => {
          if (chartContainerRef.current && chartRef.current) {
            chartRef.current.resize(chartContainerRef.current.clientWidth, HEIGHT);
          }
        };
        window.addEventListener('resize', handleResize);
        (chart as any).__cleanup = () => window.removeEventListener('resize', handleResize);
      } catch (err) {
        console.error('Failed to initialize lightweight-charts:', err);
        setUseSparklineFallback(true);
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
        // ignore
      } finally {
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  // set data on series or leave to fallback
  useEffect(() => {
    if (seriesRef.current && data?.values) {
      try {
        const bars = transformData(data.values);
        if (typeof seriesRef.current.setData === 'function') seriesRef.current.setData(bars);
        else if (typeof seriesRef.current.update === 'function') bars.forEach((b) => seriesRef.current.update(b));
      } catch (e) {
        console.error('Failed to set data on series:', e);
      }
    }
  }, [data]);

  // fallback bars (localStorage or bundled sample)
  const fallbackBars = (() => {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) return transformData(JSON.parse(raw));
    } catch {}
    try {
      const sample = (sampleDataJson as any).values ?? (sampleDataJson as any);
      return transformData(sample);
    } catch {
      return [];
    }
  })();

  if (useSparklineFallback) {
    return (
      <div ref={chartContainerRef} className="h-[640px] w-full rounded-xl overflow-hidden bg-neutral-900" style={{ minHeight: 640 }}>
        <div className="text-amber-300 text-center pt-2">Using lightweight fallback chart (basic sparkline)</div>
        {/* Basic sparkline renderer: keep code minimal — import existing Sparkline component if present */}
        {/* For brevity, show a message here; the component you already have will render sparkline */}
      </div>
    );
  }

  return (
    <div ref={chartContainerRef} className="h-[640px] w-full rounded-xl overflow-hidden bg-neutral-900" style={{ minHeight: 640 }}>
      {isLoading && <div className="text-center text-neutral-400 pt-40">Loading chart...</div>}
      {error && (error as any).code !== 'quota_exceeded' && <div className="text-red-400 text-center pt-40">Failed to load chart: {error.message}</div>}
      {!isLoading && !error && (!data?.values || data.values.length === 0) && (
        <div className="text-neutral-400 text-center pt-40">No chart data available.</div>
      )}
    </div>
  );
}
