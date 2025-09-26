import { useEffect, useRef, useState } from 'react';
import type { IChartApi, UTCTimestamp } from 'lightweight-charts'; // only for types
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

/**
 * Simple SVG sparkline renderer used as a robust fallback when lightweight-charts isn't available
 * or when the runtime chart instance doesn't expose series creation methods.
 */
function Sparkline({ bars }: { bars: Bar[] }) {
  if (!bars || bars.length === 0) {
    return <div className="text-neutral-400 text-center pt-40">No chart data available.</div>;
  }

  const width = 800;
  const height = 420;
  const padding = 24;

  const closes = bars.map((b) => b.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;

  const x = (i: number) => padding + (i / (closes.length - 1)) * (width - padding * 2);
  const y = (v: number) => padding + (1 - (v - min) / range) * (height - padding * 2);

  const path = closes.map((c, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(c)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 640 }}>  {/* Updated height to match main chart */}
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#16a34a" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#16a34a" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke="#16a34a" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {/* area under curve */}
      <path
        d={`${path} L ${x(closes.length - 1)} ${height - padding} L ${x(0)} ${height - padding} Z`}
        fill="url(#g)"
        opacity={0.8}
      />
      {/* Y axis labels (min/max) */}
      <text x={8} y={padding + 12} fill="#e5e5e5" fontSize="11">
        {max.toFixed(2)}
      </text>
      <text x={8} y={height - 8} fill="#9ca3af" fontSize="11">
        {min.toFixed(2)}
      </text>
    </svg>
  );
}

export default function MainChart({ symbol }: { symbol: string }) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);
  const { data, isLoading, error } = useCandleData(symbol);

  const [fallbackBars, setFallbackBars] = useState<Bar[] | null>(null);
  const [useSparklineFallback, setUseSparklineFallback] = useState(false);

  const cacheKey = `timeseries:${symbol}`;

  // Persist successful responses for fallback use
  useEffect(() => {
    if (data?.values) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(data.values));
      } catch {
        // ignore
      }
    }
  }, [data, cacheKey]);

  // If quota exceeded or other error, attempt to load local cache or bundled sample
  useEffect(() => {
    if (error) {
      const anyErr = error as any;
      if (anyErr?.code === 'quota_exceeded' || anyErr?.message?.toLowerCase?.().includes('quota')) {
        // prefer cached localStorage first
        try {
          const raw = localStorage.getItem(cacheKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            const bars = transformData(parsed);
            setFallbackBars(bars);
            return;
          }
        } catch {
          // ignore
        }
        // fallback to bundled sample data
        try {
          const sample = (sampleDataJson as any).values ?? (sampleDataJson as any);
          const bars = transformData(sample);
          setFallbackBars(bars);
          return;
        } catch {
          // ignore
        }
      }
    }
    // If no error or not quota-related, clear fallback
    setFallbackBars(null);
  }, [error, cacheKey]);

  useEffect(() => {
    // If we already decided to render sparkline fallback, skip chart initialization
    if (useSparklineFallback) return;

    if (!chartContainerRef.current) return;

    // Remove old chart if it exists (guarded)
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
        // dynamic import ensures we pick up the runtime module
        const module = await import('lightweight-charts');
        if (!mounted || !chartContainerRef.current) return;

        const { createChart, ColorType } = module;
        const chart = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: 640,  // Increased from 500px
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
          },
          timeScale: {
            borderColor: '#444',
          },
          crosshair: {
            mode: 0,
          },
        });

        // debug keys for inspection (helpful when chart methods are minified)
        try {
          // eslint-disable-next-line no-console
          console.debug('chart instance keys:', Object.keys(chart as any));
        } catch {}

        chartRef.current = chart;

        // Defensive creation of series. If the chart instance does not expose expected methods,
        // fallback to sparkline renderer (robust).
        const asAny = chart as any;
        const hasCandles = typeof asAny.addCandlestickSeries === 'function';
        const hasLine = typeof asAny.addLineSeries === 'function';

        if (hasCandles) {
          seriesRef.current = asAny.addCandlestickSeries({
            upColor: '#16a34a',
            downColor: '#dc2626',
            borderUpColor: '#16a34a',
            borderDownColor: '#dc2626',
            wickUpColor: '#16a34a',
            wickDownColor: '#dc2626',
          });
        } else if (hasLine) {
          console.warn('addCandlestickSeries missing, using addLineSeries fallback');
          seriesRef.current = asAny.addLineSeries();
        } else {
          // If neither API is available, enable sparkline fallback renderer and bail
          console.error('Chart instance does not support candlestick or line series. Chart keys:', Object.keys(chart as any));
          setUseSparklineFallback(true);
          try {
            // remove the created chart to avoid stray DOM
            chart.remove();
          } catch {}
          chartRef.current = null;
          seriesRef.current = null;
          return;
        }

        // If cached data exists, set it
        try {
          const raw = localStorage.getItem(cacheKey);
          if (raw && seriesRef.current) {
            const cached = JSON.parse(raw);
            const bars = transformData(cached);
            if (typeof seriesRef.current.setData === 'function') {
              seriesRef.current.setData(bars);
            }
          }
        } catch {
          // ignore cache read errors
        }

        // resize
        const handleResize = () => {
          if (chartContainerRef.current && chartRef.current) {
            try {
              chartRef.current.resize(chartContainerRef.current.clientWidth, 640);  // Use 640px height consistently
            } catch {
              /* ignore */
            }
          }
        };
        window.addEventListener('resize', handleResize);
        
        // Initial resize to set proper dimensions
        handleResize();
        
        (chart as any).__cleanup = () => window.removeEventListener('resize', handleResize);
      } catch (err) {
        console.error('Error initializing chart:', err);
        // fallback to sparkline renderer if chart init fails
        setUseSparklineFallback(true);
        if (chartContainerRef.current) {
          chartContainerRef.current.innerHTML =
            '<div style="padding:18px;color:#f87171;text-align:center;">Chart failed to initialize and a lightweight fallback is being used.</div>';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, useSparklineFallback]);

  // When real series exists and data arrives, populate it
  useEffect(() => {
    if (seriesRef.current && data?.values) {
      try {
        const bars = transformData(data.values);
        if (typeof seriesRef.current.setData === 'function') {
          seriesRef.current.setData(bars);
        } else if (typeof seriesRef.current.update === 'function') {
          bars.forEach((b) => seriesRef.current.update(b));
        }
      } catch (err) {
        console.error('Failed to set chart data:', err);
      }
    }
  }, [data]);

  // If we decided to render sparkline fallback OR we have fallbackBars (quota/sample), render Sparkline
  if (useSparklineFallback || fallbackBars) {
    const barsToRender = fallbackBars ?? (data?.values ? transformData(data.values) : []);

    // If there are no bars to render yet, show messages
    if (!barsToRender || barsToRender.length === 0) {
      if (error && (error as any).code === 'quota_exceeded') {
        return (
          <div className="h-[680px] w-full rounded-xl overflow-hidden bg-neutral-900" style={{ minHeight: 640, minWidth: 320 }}>  {/* Updated height */}
            <div className="text-center text-red-400 pt-40">API credits exhausted for today. Showing fallback view.</div>
            <div className="text-neutral-400 text-center mt-2">No cached data available.</div>
          </div>
        );
      }
      return (
        <div className="h-[680px] w-full rounded-xl overflow-hidden bg-neutral-900" style={{ minHeight: 640, minWidth: 320 }}>  {/* Updated height */}
          <div className="text-neutral-400 text-center pt-40">Loading fallback chart...</div>
        </div>
      );
    }

    return (
      <div className="h-[680px] w-full rounded-xl overflow-hidden bg-neutral-900" style={{ minHeight: 640, minWidth: 320 }}>  {/* Updated height */}
        <div className="text-amber-300 text-center pt-2">Using lightweight fallback chart (basic sparkline)</div>
        <Sparkline bars={barsToRender} />
      </div>
    );
  }

  // Normal container (the lightweight-charts instance will mount into this div)
  return (
    <div
      ref={chartContainerRef}
      className="h-[680px] w-full rounded-xl overflow-hidden bg-neutral-900"
      style={{ minHeight: 640, minWidth: 320 }}
    >
      {isLoading && <div className="text-center text-neutral-400 pt-40">Loading chart...</div>}
      {error && (error as any).code !== 'quota_exceeded' && (
        <div className="text-red-400 text-center pt-40">Failed to load chart: {error.message}</div>
      )}
      {!isLoading && !error && (!data?.values || data.values.length === 0) && (
        <div className="text-neutral-400 text-center pt-40">No chart data available.</div>
      )}
    </div>
  );
}
