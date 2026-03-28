import type { Quote } from '../types/market';

function fmt(n: number, d = 2) {
  return n?.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) ?? '—';
}
function fmtPct(n: number) {
  if (n == null) return '—';
  const pos = n >= 0;
  return <span style={{ color: pos ? 'var(--neon-green)' : 'var(--neon-red)' }}>{pos ? '▲' : '▼'}{Math.abs(n).toFixed(2)}%</span>;
}
function fmtVol(n: number) {
  if (!n) return '—';
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  return (n / 1e3).toFixed(0) + 'K';
}

const STATE_LABELS: Record<string, { label: string; color: string }> = {
  REGULAR:  { label: 'OPEN',   color: 'var(--neon-green)' },
  PRE:      { label: 'PRE',    color: 'var(--neon-cyan)' },
  PREPRE:   { label: 'PRE',    color: 'var(--neon-cyan)' },
  POST:     { label: 'A/H',    color: 'var(--neon-magenta)' },
  POSTPOST: { label: 'A/H',    color: 'var(--neon-magenta)' },
  CLOSED:   { label: 'CLOSED', color: 'rgba(0,255,65,0.35)' },
};

interface Props {
  quotes: Quote[];
  customTickers?: string[];
  onRemove?: (ticker: string) => void;
}

const th: React.CSSProperties = {
  padding: '8px 10px',
  fontSize: 10,
  letterSpacing: 2,
  color: 'var(--neon-magenta)',
  borderBottom: '1px solid var(--neon-magenta)',
  fontFamily: 'Share Tech Mono, monospace',
  textAlign: 'left',
  whiteSpace: 'nowrap',
};
const thR: React.CSSProperties = { ...th, textAlign: 'right' };

export default function StocksTable({ quotes, customTickers = [], onRemove }: Props) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Share Tech Mono, monospace' }}>
        <thead>
          <tr>
            <th style={th}>SYMBOL</th>
            <th style={thR}>PRICE</th>
            <th style={thR}>CHG%</th>
            <th style={thR}>EXT PRICE</th>
            <th style={thR}>EXT CHG%</th>
            <th style={{ ...thR, display: 'table-cell' }} className="hidden-xs">VOL</th>
            <th style={{ ...thR, display: 'table-cell' }} className="hidden-sm">52W RANGE</th>
            <th style={{ ...th, textAlign: 'center' }}>STATUS</th>
            <th style={{ ...th, padding: '8px 6px' }}></th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((q, i) => {
            const isCustom = customTickers.includes(q.symbol);
            const hasPost = q.marketState === 'POST' || q.marketState === 'POSTPOST';
            const hasPre  = q.marketState === 'PRE'  || q.marketState === 'PREPRE';
            const afterPrice = hasPost ? q.postMarketPrice : hasPre ? q.preMarketPrice : null;
            const afterPct   = hasPost ? q.postMarketChangePercent : hasPre ? q.preMarketChangePercent : null;

            const range = q.fiftyTwoWeekHigh - q.fiftyTwoWeekLow;
            const pct52 = range > 0 ? ((q.regularMarketPrice - q.fiftyTwoWeekLow) / range) * 100 : 0;

            const state = STATE_LABELS[q.marketState] ?? STATE_LABELS.CLOSED;
            const dayPos = q.regularMarketChangePercent >= 0;
            const rowBg = i % 2 === 0 ? 'transparent' : 'rgba(0,238,255,0.02)';

            return (
              <tr key={q.symbol} style={{ background: rowBg, borderBottom: '1px solid rgba(0,255,65,0.08)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,238,255,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = rowBg)}>

                <td style={{ padding: '10px 10px' }}>
                  <div style={{ fontFamily: 'VT323, monospace', fontSize: 18, color: isCustom ? 'var(--neon-yellow)' : 'var(--neon-cyan)', letterSpacing: 1 }}>
                    {isCustom && <span style={{ fontSize: 12, marginRight: 3, color: 'var(--neon-yellow)' }}>★</span>}
                    {q.symbol}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(0,238,255,0.4)', marginTop: 1, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {q.shortName}
                  </div>
                </td>

                <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: 'VT323, monospace', fontSize: 20, color: 'var(--neon-cyan)' }}>
                  {fmt(q.regularMarketPrice)}
                </td>

                <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: 'VT323, monospace', fontSize: 18 }}>
                  {fmtPct(q.regularMarketChangePercent)}
                </td>

                <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: 'VT323, monospace', fontSize: 18, color: 'rgba(0,238,255,0.7)' }}>
                  {afterPrice != null ? fmt(afterPrice) : <span style={{ color: 'rgba(0,255,65,0.2)' }}>—</span>}
                </td>

                <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: 'VT323, monospace', fontSize: 18 }}>
                  {afterPct != null ? fmtPct(afterPct) : <span style={{ color: 'rgba(0,255,65,0.2)' }}>—</span>}
                </td>

                <td style={{ padding: '10px 10px', textAlign: 'right', fontSize: 12, color: 'rgba(0,238,255,0.5)' }}>
                  {fmtVol(q.regularMarketVolume)}
                </td>

                <td style={{ padding: '10px 10px', minWidth: 140 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 9, color: 'rgba(0,255,65,0.35)' }}>{fmt(q.fiftyTwoWeekLow, 0)}</span>
                    <div style={{ flex: 1, background: 'rgba(0,255,65,0.1)', height: 4, minWidth: 60, border: '1px solid rgba(0,255,65,0.2)' }}>
                      <div style={{ width: `${Math.min(100, Math.max(0, pct52))}%`, height: '100%', background: dayPos ? 'var(--neon-green)' : 'var(--neon-red)', boxShadow: `0 0 4px ${dayPos ? 'var(--neon-green)' : 'var(--neon-red)'}` }} />
                    </div>
                    <span style={{ fontSize: 9, color: 'rgba(0,255,65,0.35)' }}>{fmt(q.fiftyTwoWeekHigh, 0)}</span>
                  </div>
                </td>

                <td style={{ padding: '10px 10px', textAlign: 'center' }}>
                  <span style={{ fontSize: 10, fontWeight: 'bold', letterSpacing: 1, color: state.color, textShadow: `0 0 6px ${state.color}` }}>
                    {state.label}
                  </span>
                </td>

                <td style={{ padding: '10px 6px', textAlign: 'center' }}>
                  {isCustom && onRemove && (
                    <button onClick={() => onRemove(q.symbol)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,34,68,0.4)', fontSize: 14, padding: 0, fontFamily: 'monospace', transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--neon-red)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,34,68,0.4)')}
                      title={`Remove ${q.symbol}`}>
                      ✕
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
