import { useState, useEffect, useCallback } from 'react';
import type { MarketData } from '../types/market';
import { getMockIndices, getMockStocks, generateVixHistory } from '../lib/mockData';

export function useMarketData(refreshInterval = 30000) {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  const fetchAll = useCallback(() => {
    const indices = getMockIndices();
    const stocks = getMockStocks();
    const vixHistory = generateVixHistory();
    setData({ indices, stocks, vixHistory, lastUpdated: new Date() });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, refreshInterval);
    return () => clearInterval(id);
  }, [fetchAll, refreshInterval]);

  return { data, loading, error, refetch: fetchAll };
}
