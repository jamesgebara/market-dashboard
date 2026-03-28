import { useState, useRef } from 'react';
import { useMarketData, DEFAULT_STOCK_SYMBOLS } from '../hooks/useMarketData';
import IndexCard from './IndexCard';
import VolatilityChart from './VolatilityChart';
import StocksTable from './StocksTable';

const STORAGE_KEY = 'market-dashboard-custom-tickers';

function loadCustomTickers(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); }
  catch { return []; }
}

function MarketStatusBanner({ marketState }: { marketState?: string }) {
  const configs: Record<string, { label: string; color: string }> = {
    REGULAR:  { label: '▶ MARKET OPEN',   color: 'var(--neon-green)' },
    PRE:      { label: '◀ PRE-MARKET',     color: 'var(--neon-cyan)' },
    PREPRE:   { label: '◀ PRE-MARKET',     color: 'var(--neon-cyan)' },
    POST:     { label: '■ AFTER HOURS',    color: 'var(--neon-magenta)' },
    POSTPOST: { label: '■ AFTER HOURS',    color: 'var(--neon-magenta)' },
    CLOSED:   { label: '● MARKET CLOSED',  color: 'var(--neon-orange)' },
  };
  const cfg = configs[marketState ?? 'CLOSED'] ?? configs.CLOSED;
  return (
    <span className="blink text-xs font-bold tracking-widest" style={{ color: cfg.color, textShadow: `0 0 8px ${cfg.color}` }}>
      {cfg.label}
    </span>
  );
}

function TickerTape({ quotes }: { quotes: { symbol: string; regularMarketChangePercent: number; regularMarketPrice: number }[] }) {
  const items = [...quotes, ...quotes];
  return (
    <div style={{ background: '#000', borderTop: '1px solid var(--neon-green)', borderBottom: '1px solid var(--neon-green)', overflow: 'hidden', height: 28 }} className="flex items-center">
      <div className="marquee-track whitespace-nowrap text-xs font-bold tracking-wider" style={{ color: 'var(--neon-green)' }}>
        {items.map((q, i) => {
          const pos = q.regularMarketChangePercent >= 0;
          return (
            <span key={i} className="mx-6">
              <span style={{ color: 'var(--neon-cyan)' }}>{q.symbol}</span>
              {' '}
              <span>{q.regularMarketPrice.toFixed(2)}</span>
              {' '}
              <span style={{ color: pos ? 'var(--neon-green)' : 'var(--neon-red)' }}>
                {pos ? '▲' : '▼'}{Math.abs(q.regularMarketChangePercent).toFixed(2)}%
              </span>
            </span>
          );
        })}
      </div>
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
    if (allStockSymbols.includes(ticker)) { setInputError(`${ticker} ALREADY TRACKED`); return; }
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
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--neon-green)', fontFamily: 'VT323, monospace', fontSize: 32 }} className="glow-green flicker">
          <div className="blink">█ LOADING MARKET DATA █</div>
          <div style={{ fontSize: 18, marginTop: 8, color: 'var(--neon-cyan)' }}>PLEASE WAIT...</div>
        </div>
      </div>
    );
  }

  const allQuotes = [...(data?.indices ?? []), ...(data?.stocks ?? [])];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }} className="flicker">

      {/* Ticker tape */}
      <TickerTape quotes={allQuotes.filter(q => q.symbol !== '^VIX')} />

      {/* Header */}
      <header style={{ background: 'var(--bg-header)', borderBottom: '2px solid var(--neon-cyan)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'VT323, monospace', fontSize: 28 }} className="rainbow-text">
              ◈ MARKET.EXE ◈
            </span>
            <span style={{ fontFamily: 'VT323, monospace', fontSize: 18, color: 'var(--neon-yellow)', letterSpacing: 2 }} className="glow-yellow">
              v2.0 VOLATILITY DASHBOARD
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            {marketState && <MarketStatusBanner marketState={marketState} />}
            <span style={{ fontSize: 11, fontWeight: 'bold', letterSpacing: 2, padding: '2px 8px', border: `1px solid ${isLive ? 'var(--neon-green)' : 'var(--neon-yellow)'}`, color: isLive ? 'var(--neon-green)' : 'var(--neon-yellow)' }} className={isLive ? 'glow-green' : 'glow-yellow'}>
              {isLive ? '◉ LIVE' : '◎ CACHED'}
            </span>
            <button onClick={refetch} style={{ background: 'none', border: 'none', color: 'var(--neon-cyan)', cursor: 'pointer', fontFamily: 'Share Tech Mono, monospace', fontSize: 11, letterSpacing: 1 }} className="glow-cyan">
              ↺ REFRESH
            </button>
            {data && <span style={{ fontSize: 10, color: 'rgba(0,255,65,0.4)', letterSpacing: 1 }}>UPD: {data.lastUpdated.toLocaleTimeString()}</span>}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 16px' }}>

        {/* Indices */}
        <section style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: 'VT323, monospace', fontSize: 20, color: 'var(--neon-magenta)', letterSpacing: 4, marginBottom: 10, borderBottom: '1px solid var(--neon-magenta)', paddingBottom: 4 }} className="glow-magenta">
            ╔══ MAJOR INDICES ══╗
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {data?.indices.map(q => <IndexCard key={q.symbol} quote={q} />)}
          </div>
        </section>

        {/* VIX Chart */}
        <section style={{ background: 'var(--bg-card)', border: '1px solid var(--neon-magenta)', marginBottom: 20, padding: 20 }} className="box-glow-magenta">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontFamily: 'VT323, monospace', fontSize: 22, color: 'var(--neon-magenta)', letterSpacing: 3 }} className="glow-magenta">
                ◈ VIX — FEAR INDEX (90-DAY)
              </div>
              <div style={{ fontSize: 11, color: 'rgba(0,238,255,0.6)', letterSpacing: 1, marginTop: 2 }}>
                CBOE VOLATILITY INDEX // S&P 500 IMPLIED VOLATILITY
              </div>
            </div>
            {vixQuote && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'VT323, monospace', fontSize: 42, color: 'var(--neon-yellow)', lineHeight: 1 }} className="glow-yellow">
                  {vixQuote.regularMarketPrice.toFixed(2)}
                </div>
                <div style={{ fontFamily: 'VT323, monospace', fontSize: 20, color: vixQuote.regularMarketChangePercent >= 0 ? 'var(--neon-red)' : 'var(--neon-green)' }}>
                  {vixQuote.regularMarketChangePercent >= 0 ? '▲' : '▼'} {Math.abs(vixQuote.regularMarketChangePercent).toFixed(2)}%
                </div>
              </div>
            )}
          </div>
          <VolatilityChart data={data?.vixHistory ?? []} currentVix={vixQuote?.regularMarketPrice} />
        </section>

        {/* Stocks Table */}
        <section style={{ background: 'var(--bg-card)', border: '1px solid var(--neon-cyan)' }} className="box-glow-cyan">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--neon-cyan)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontFamily: 'VT323, monospace', fontSize: 22, color: 'var(--neon-cyan)', letterSpacing: 3 }} className="glow-cyan">
                ◈ STOCKS &amp; ETFs
              </div>
              <div style={{ fontSize: 11, color: 'rgba(0,238,255,0.5)', letterSpacing: 1, marginTop: 2 }}>
                PRE-MARKET // AFTER-HOURS // EXTENDED TRADING
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <form style={{ display: 'flex', gap: 8 }} onSubmit={e => { e.preventDefault(); addTicker(); }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => { setInput(e.target.value.toUpperCase()); setInputError(''); }}
                  placeholder="ADD TICKER..."
                  maxLength={10}
                  className="retro"
                  style={{ padding: '6px 10px', fontSize: 13, width: 140, borderRadius: 0 }}
                />
                <button type="submit" className="retro-btn" style={{ padding: '6px 14px', fontSize: 13, borderRadius: 0 }}>
                  + ADD
                </button>
              </form>
              {inputError && <div style={{ fontSize: 11, color: 'var(--neon-red)' }} className="blink">{inputError}</div>}
            </div>
          </div>
          <StocksTable quotes={data?.stocks ?? []} customTickers={customTickers} onRemove={removeTicker} />
        </section>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '20px 0 8px', fontSize: 11, color: 'rgba(0,255,65,0.3)', letterSpacing: 2 }}>
          DATA: YAHOO FINANCE // AUTO-REFRESH: 30S // AFTER-HRS MAY BE DELAYED
          <span className="blink" style={{ marginLeft: 8 }}>█</span>
        </div>
      </main>
    </div>
  );
}
