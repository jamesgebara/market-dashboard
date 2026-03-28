import { useState, useRef } from 'react';
import { useMarketData, DEFAULT_STOCK_SYMBOLS } from '../hooks/useMarketData';
import IndexCard from './IndexCard';
import VolatilityChart from './VolatilityChart';
import StocksTable from './StocksTable';
import { RefreshCw, TrendingUp, Clock, Plus } from 'lucide-react';

const STORAGE_KEY = 'market-dashboard-custom-tickers';

function loadCustomTickers(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function MarketStatusBanner({ marketState }: { marketState?: string }) {
  if (!marketState) return null;
  const configs: Record<string, { label: string; desc: string; cls: string }> = {
    REGULAR:  { label: 'Market Open',   desc: 'NYSE & NASDAQ trading in session',              cls: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
    PRE:      { label: 'Pre-Market',    desc: 'Extended hours trading 4:00 AM – 9:30 AM ET',   cls: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
    PREPRE:   { label: 'Pre-Market',    desc: 'Extended hours trading 4:00 AM – 9:30 AM ET',   cls: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
    POST:     { label: 'After Hours',   desc: 'Extended hours trading 4:00 PM – 8:00 PM ET',   cls: 'bg-purple-500/10 border-purple-500/30 text-purple-400' },
    POSTPOST: { label: 'After Hours',   desc: 'Extended hours trading 4:00 PM – 8:00 PM ET',   cls: 'bg-purple-500/10 border-purple-500/30 text-purple-400' },
    CLOSED:   { label: 'Market Closed', desc: 'Regular trading hours: 9:30 AM – 4:00 PM ET',   cls: 'bg-gray-500/10 border-gray-500/30 text-gray-400' },
  };
  const cfg = configs[marketState] ?? configs.CLOSED;
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${cfg.cls}`}>
      <Clock size={12} />
      <span className="font-semibold">{cfg.label}</span>
      <span className="text-current opacity-70">· {cfg.desc}</span>
    </div>
  );
}

export default function MarketDashboard() {
  const [customTickers, setCustomTickers] = useState<string[]>(loadCustomTickers);
  const [input, setInput] = useState('');
  const [inputError, setInputError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const allStockSymbols = [...DEFAULT_STOCK_SYMBOLS, ...customTickers];
  const { data, loading, refetch, isLive } = useMarketData(allStockSymbols);

  const vixQuote = data?.indices.find(q => q.symbol === '^VIX');
  const marketState = data?.indices[0]?.marketState;

  function addTicker() {
    const ticker = input.trim().toUpperCase();
    if (!ticker) return;
    if (allStockSymbols.includes(ticker)) {
      setInputError(`${ticker} is already on the list`);
      return;
    }
    const updated = [...customTickers, ticker];
    setCustomTickers(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setInput('');
    setInputError('');
    setTimeout(() => refetch(), 100);
  }

  function removeTicker(ticker: string) {
    const updated = customTickers.filter(t => t !== ticker);
    setCustomTickers(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Fetching market data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="text-blue-400" size={22} />
            <h1 className="text-lg font-bold tracking-tight">Market Volatility Dashboard</h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {marketState && <MarketStatusBanner marketState={marketState} />}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isLive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
              {isLive ? '● Live' : '● Delayed'}
            </span>
            <button onClick={refetch} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
              <RefreshCw size={12} />
              Refresh
            </button>
            {data && <span className="text-xs text-gray-600">Updated {data.lastUpdated.toLocaleTimeString()}</span>}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Indices */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Major Indices</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {data?.indices.map(q => <IndexCard key={q.symbol} quote={q} />)}
          </div>
        </section>

        {/* VIX Chart */}
        <section className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold">VIX — Volatility Index (90-Day)</h2>
              <p className="text-xs text-gray-500 mt-0.5">CBOE Volatility Index measuring S&amp;P 500 expected volatility over the next 30 days</p>
            </div>
            {vixQuote && (
              <div className="text-right">
                <div className="text-2xl font-bold">{vixQuote.regularMarketPrice.toFixed(2)}</div>
                <div className={`text-sm font-semibold ${vixQuote.regularMarketChangePercent >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {vixQuote.regularMarketChangePercent >= 0 ? '+' : ''}{vixQuote.regularMarketChangePercent.toFixed(2)}%
                </div>
              </div>
            )}
          </div>
          <VolatilityChart data={data?.vixHistory ?? []} currentVix={vixQuote?.regularMarketPrice} />
        </section>

        {/* Stocks Table */}
        <section className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="p-5 border-b border-gray-700 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-base font-bold">Stocks & ETFs</h2>
              <p className="text-xs text-gray-500 mt-0.5">Including pre-market and after-hours extended trading prices</p>
            </div>
            {/* Add ticker input */}
            <div className="flex flex-col items-end gap-1">
              <form
                className="flex items-center gap-2"
                onSubmit={e => { e.preventDefault(); addTicker(); }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => { setInput(e.target.value.toUpperCase()); setInputError(''); }}
                  placeholder="Add ticker…"
                  maxLength={10}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-32"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  <Plus size={14} />
                  Add
                </button>
              </form>
              {inputError && <p className="text-xs text-red-400">{inputError}</p>}
            </div>
          </div>
          <StocksTable
            quotes={data?.stocks ?? []}
            customTickers={customTickers}
            onRemove={removeTicker}
          />
        </section>

        <footer className="text-center text-xs text-gray-600 pb-4">
          Data sourced from Yahoo Finance · Refreshes every 30 seconds · After-hours prices may have 15-min delay
        </footer>
      </main>
    </div>
  );
}
