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

function fmtPct(n: number) {
  if (n == null) return '—';
  return `${n >= 0 ? '+' : ''}${fmt(n)}%`;
}

interface Props {
  quote: Quote;
}

export default function IndexCard({ quote }: Props) {
  const isVix = quote.symbol === '^VIX';
  const name = INDEX_NAMES[quote.symbol] ?? quote.shortName;
  const change = quote.regularMarketChange;
  const changePct = quote.regularMarketChangePercent;
  const positive = change >= 0;

  // After hours data
  const hasPost = quote.marketState === 'POST' || quote.marketState === 'POSTPOST';
  const hasPre = quote.marketState === 'PRE' || quote.marketState === 'PREPRE';
  const afterPrice = hasPost ? quote.postMarketPrice : hasPre ? quote.preMarketPrice : null;
  const afterChangePct = hasPost ? quote.postMarketChangePercent : hasPre ? quote.preMarketChangePercent : null;
  const afterPositive = (afterChangePct ?? 0) >= 0;

  const vixLabel = isVix
    ? quote.regularMarketPrice < 15 ? 'Low Volatility'
    : quote.regularMarketPrice < 20 ? 'Normal'
    : quote.regularMarketPrice < 30 ? 'Elevated'
    : quote.regularMarketPrice < 40 ? 'High'
    : 'Extreme Fear'
    : null;

  const vixColor = isVix
    ? quote.regularMarketPrice < 15 ? 'text-emerald-400'
    : quote.regularMarketPrice < 20 ? 'text-blue-400'
    : quote.regularMarketPrice < 30 ? 'text-yellow-400'
    : quote.regularMarketPrice < 40 ? 'text-orange-400'
    : 'text-red-400'
    : '';

  return (
    <div className={`bg-gray-800 rounded-xl p-4 border ${isVix ? 'border-purple-500/40' : 'border-gray-700'} hover:border-gray-500 transition-colors`}>
      <div className="flex justify-between items-start mb-1">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{name}</span>
        {isVix && vixLabel && (
          <span className={`text-xs font-bold ${vixColor}`}>{vixLabel}</span>
        )}
      </div>

      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl font-bold text-white">{fmt(quote.regularMarketPrice)}</span>
        <span className={`text-sm font-semibold ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
          {fmtPct(changePct)}
        </span>
      </div>

      <div className={`text-xs mt-0.5 ${positive ? 'text-emerald-500' : 'text-red-500'}`}>
        {change >= 0 ? '+' : ''}{fmt(change)} pts
      </div>

      {afterPrice != null && (
        <div className={`mt-2 pt-2 border-t border-gray-700 flex items-center justify-between`}>
          <span className="text-xs text-gray-500">{hasPost ? 'After Hours' : 'Pre-Market'}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-gray-200">{fmt(afterPrice)}</span>
            {afterChangePct != null && (
              <span className={`text-xs font-semibold ${afterPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {fmtPct(afterChangePct)}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-600">
        H: {fmt(quote.regularMarketDayHigh)} · L: {fmt(quote.regularMarketDayLow)}
      </div>
    </div>
  );
}
