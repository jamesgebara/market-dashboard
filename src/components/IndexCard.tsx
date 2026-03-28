import type { Quote } from '../types/market';

const INDEX_NAMES: Record<string, string> = {
  '^GSPC': 'S&P 500',
  '^IXIC': 'NASDAQ',
  '^DJI': 'DOW JONES',
  '^RUT': 'RUSSELL 2000',
  '^VIX': 'VIX',
};

function fmt(n: number, decimals = 2) {
  return n?.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) ?? '—';
}

interface Props { quote: Quote; }

export default function IndexCard({ quote }: Props) {
  const isVix = quote.symbol === '^VIX';
  const name = INDEX_NAMES[quote.symbol] ?? quote.shortName;
  const positive = quote.regularMarketChange >= 0;

  const hasPost = quote.marketState === 'POST' || quote.marketState === 'POSTPOST';
  const hasPre  = quote.marketState === 'PRE'  || quote.marketState === 'PREPRE';
  const afterPrice  = hasPost ? quote.postMarketPrice  : hasPre ? quote.preMarketPrice  : null;
  const afterPct    = hasPost ? quote.postMarketChangePercent : hasPre ? quote.preMarketChangePercent : null;
  const afterPos    = (afterPct ?? 0) >= 0;

  const vixLevel = isVix
    ? quote.regularMarketPrice < 15 ? { label: 'CALM',    color: 'var(--neon-green)' }
    : quote.regularMarketPrice < 20 ? { label: 'LOW',     color: 'var(--neon-cyan)' }
    : quote.regularMarketPrice < 30 ? { label: 'ELEVATED',color: 'var(--neon-yellow)' }
    : quote.regularMarketPrice < 40 ? { label: 'HIGH',    color: 'var(--neon-orange)' }
    : { label: '⚠ EXTREME', color: 'var(--neon-red)' }
    : null;

  const borderColor = isVix ? 'var(--neon-magenta)' : positive ? 'var(--neon-green)' : 'var(--neon-red)';
  const priceColor  = isVix ? 'var(--neon-yellow)' : 'var(--neon-cyan)';

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${borderColor}`,
      boxShadow: `0 0 8px ${borderColor}33`,
      padding: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(0,238,255,0.7)', fontFamily: 'Share Tech Mono, monospace' }}>
          {name}
        </span>
        {vixLevel && (
          <span style={{ fontSize: 10, fontWeight: 'bold', color: vixLevel.color, letterSpacing: 1, textShadow: `0 0 6px ${vixLevel.color}` }}>
            {vixLevel.label}
          </span>
        )}
      </div>

      <div style={{ fontFamily: 'VT323, monospace', fontSize: 36, color: priceColor, lineHeight: 1, textShadow: `0 0 10px ${priceColor}` }}>
        {fmt(quote.regularMarketPrice)}
      </div>

      <div style={{ fontFamily: 'VT323, monospace', fontSize: 18, color: positive ? 'var(--neon-green)' : 'var(--neon-red)', marginTop: 2 }}>
        {positive ? '▲' : '▼'} {Math.abs(quote.regularMarketChangePercent).toFixed(2)}%
      </div>

      {afterPrice != null && (
        <div style={{ marginTop: 8, paddingTop: 6, borderTop: `1px solid ${borderColor}44`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 9, color: 'rgba(0,238,255,0.5)', letterSpacing: 1 }}>
            {hasPost ? 'A/H' : 'PRE'}
          </span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontFamily: 'VT323, monospace', fontSize: 16, color: 'rgba(0,238,255,0.85)' }}>{fmt(afterPrice)}</span>
            {afterPct != null && (
              <span style={{ fontFamily: 'VT323, monospace', fontSize: 14, color: afterPos ? 'var(--neon-green)' : 'var(--neon-red)' }}>
                {afterPos ? '▲' : '▼'}{Math.abs(afterPct).toFixed(2)}%
              </span>
            )}
          </div>
        </div>
      )}

      <div style={{ marginTop: 4, fontSize: 9, color: 'rgba(0,255,65,0.3)', letterSpacing: 1 }}>
        H:{fmt(quote.regularMarketDayHigh)} L:{fmt(quote.regularMarketDayLow)}
      </div>
    </div>
  );
}
