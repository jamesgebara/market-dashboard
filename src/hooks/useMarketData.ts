import { useState, useEffect, useCallback } from 'react';
import type { MarketData, Quote, ChartPoint } from '../types/market';
import { getMockIndices, getMockStocks, getPlaceholderQuote, generateVixHistory } from '../lib/mockData';

const INDEX_SYMBOLS = ['^GSPC', '^IXIC', '^DJI', '^RUT', '^VIX'];
export const DEFAULT_STOCK_SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA', 'AMD', 'SPY', 'QQQ'];

async function fetchQuotes(symbols: string[]): Promise<Quote[] | null> {
  try {
    const res = await fetch(`/api/quotes?symbols=${symbols.join(',')}`);
    if (!res.ok) return null;
    const data = await res.json();
    const result: Quote[] = data.quoteResponse?.result ?? [];
    return result.length > 0 ? result : null;
  } catch {
    return null;
  }
}

async function fetchVixHistory(): Promise<ChartPoint[] | null> {
  try {
    const res = await fetch('/api/vix-history');
    if (!res.ok) return null;
    const data = await res.json();
    const chart = data.chart?.result?.[0];
    if (!chart) return null;
    const timestamps: number[] = chart.timestamp ?? [];
    const closes: number[] = chart.indicators?.quote?.[0]?.close ?? [];
    const points = timestamps
      .map((t, i) => ({ timestamp: t * 1000, close: closes[i] }))
      .filter(p => p.close != null);
    return points.length > 0 ? points : null;
  } catch {
    return null;
  }
}

export function useMarketData(stockSymbols: string[], refreshInterval = 30000) {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const symbolsKey = stockSymbols.join(',');

  const fetchAll = useCallback(async () => {
    const symbols = symbolsKey.split(',');
    const [liveIndices, liveStocks, liveVix] = await Promise.all([
      fetchQuotes(INDEX_SYMBOLS),
      fetchQuotes(symbols),
      fetchVixHistory(),
    ]);

    const live = !!(liveIndices && liveStocks);
    setIsLive(live);
    const mockStocks = getMockStocks();
    const mockSymbols = new Set(mockStocks.map(q => q.symbol));
    const fallbackStocks = [
      ...mockStocks,
      ...symbols.filter(s => !mockSymbols.has(s)).map(getPlaceholderQuote),
    ];
    setData({
      indices: liveIndices ?? getMockIndices(),
      stocks: liveStocks ?? fallbackStocks,
      vixHistory: liveVix ?? generateVixHistory(),
      lastUpdated: new Date(),
    });
    setLoading(false);
  }, [symbolsKey]);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, refreshInterval);
    return () => clearInterval(id);
  }, [fetchAll, refreshInterval]);

  return { data, loading, error: null, isLive, refetch: fetchAll };
}
