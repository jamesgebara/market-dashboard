import { useState, useEffect, useCallback } from 'react';
import type { MarketData, Quote, ChartPoint } from '../types/market';

const INDEX_SYMBOLS = ['^GSPC', '^IXIC', '^DJI', '^RUT', '^VIX'];
const STOCK_SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA', 'AMD', 'SPY', 'QQQ'];

async function fetchQuotes(symbols: string[]): Promise<Quote[]> {
  const encoded = symbols.map(s => encodeURIComponent(s)).join(',');
  const res = await fetch(`/api/quotes?symbols=${encoded}`);
  if (!res.ok) throw new Error('Failed to fetch quotes');
  const data = await res.json();
  return data.quoteResponse?.result ?? [];
}

async function fetchVixHistory(): Promise<ChartPoint[]> {
  const res = await fetch('/api/vix-history');
  if (!res.ok) throw new Error('Failed to fetch VIX history');
  const data = await res.json();
  const chart = data.chart?.result?.[0];
  if (!chart) return [];
  const timestamps: number[] = chart.timestamp ?? [];
  const closes: number[] = chart.indicators?.quote?.[0]?.close ?? [];
  return timestamps
    .map((t, i) => ({ timestamp: t * 1000, close: closes[i] }))
    .filter(p => p.close != null);
}

export function useMarketData(refreshInterval = 30000) {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [indices, stocks, vixHistory] = await Promise.all([
        fetchQuotes(INDEX_SYMBOLS),
        fetchQuotes(STOCK_SYMBOLS),
        fetchVixHistory(),
      ]);
      setData({ indices, stocks, vixHistory, lastUpdated: new Date() });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, refreshInterval);
    return () => clearInterval(id);
  }, [fetchAll, refreshInterval]);

  return { data, loading, error, refetch: fetchAll };
}
