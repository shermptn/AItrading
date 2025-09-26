import { useEffect, useRef } from 'react';
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
      const res = await apiGet<any>('timeseries', { symbol, interval: '1day', limit: '250' });
      return res;
    },
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
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);
  const { data, isLoading, error } = useCandleData(symbol);

  useEffect(() => {
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

    // Create new chart
    let chart: IChartApi | null = null;
    try {
      chart = createChart(chartContainerRef.current, {
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
        },
        timeScale: {
          borderColor: '#444',
        },
        crosshair: {
          mode: 0,
        },
      });
      chartRef.current = chart;
    } catch (err) {
      console.error('Failed to create chart:', err);
      if (chartContainerRef.current) {
        chartContainerRef.current.innerHTML =
          '<div style="padding:18px;color:#f87171;text-align:center;">Chart failed to initialize.</div>';
      }
      return;
    }

    // Create series safely: feature-detect addCandlestickSeries (some builds/versions may differ)
    try {
      const asAny = chart as any;
      if (typeof asAny.addCandlestickSeries === 'function') {
        const candleSeries = asAny.addCandlestickSeries({
          upColor: '#16a34a',
          downColor: '#dc2626',
          borderUpColor: '#16a34a',
          borderDownColor: '#dc2626',
          wickUpColor: '#16a34a',
          wickDownColor: '#dc2626',
        });
        seriesRef.current = candleSeries;
      } else {
        // Fallback to a line series (prevents runtime crash and still shows price)
        console.warn('addCandlestickSeries not available on chart instance; falling back to line series.');
        if (typeof asAny.addLineSeries === 'function') {
          seriesRef.current = asAny.addLineSeries();
        } else {
          // last-resort: do nothing and display a friendly notice
          if (chartContainerRef.current) {
            chartContainerRef.current.innerHTML =
              '<div style="padding:18px;color:#fbbf24;text-align:center;">Chart type not supported in this build. Please update the chart library.</div>';
          }
        }
      }
    } catch (err) {
      console.error('Error creating series:', err);
    }

    // Responsive chart
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.resize(chartContainerRef.current.clientWidth, 500);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      try {
        chart?.remove();
      } catch (e) {
        // ignore
      }
    };
  }, [symbol]);

  // Set data whenever it changes
  useEffect(() => {
    if (seriesRef.current && data?.values) {
      try {
        const bars = transformData(data.values);
        if (typeof seriesRef.current.setData === 'function') {
          seriesRef.current.setData(bars);
        } else if (typeof seriesRef.current.update === 'function') {
          // attempt best-effort update if an older API is present
          bars.forEach((b) => seriesRef.current.update(b));
        } else {
          console.warn('Series does not support setData/update.');
        }
      } catch (err) {
        console.error('Failed to set chart data:', err);
      }
    }
  }, [data]);

  return (
    <div
      ref={chartContainerRef}
      className="h-[520px] w-full rounded-xl overflow-hidden bg-neutral-900"
      style={{ minHeight: 400, minWidth: 320 }}
    >
      {isLoading && <div className="text-center text-neutral-400 pt-40">Loading chart...</div>}
      {error && <div className="text-red-400 text-center pt-40">Failed to load chart: {error.message}</div>}
      {!isLoading && !error && (!data?.values || data.values.length === 0) && (
        <div className="text-neutral-400 text-center pt-40">No chart data available.</div>
      )}
    </div>
  );
}
