import type { Quote } from '../types/market';

function fmt(n: number, decimals = 2) {
  return n?.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) ?? '—';
}
function fmtPct(n: number) {
  if (n == null) return '—';
  return `${n >= 0 ? '+' : ''}${fmt(n)}%`;
}
function fmtVol(n: number) {
  if (!n) return '—';
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K';
  return String(n);
}

interface Props {
  quotes: Quote[];
}

function MarketStateChip({ state }: { state: Quote['marketState'] }) {
  const configs: Record<string, { label: string; cls: string }> = {
    REGULAR: { label: 'Open', cls: 'bg-emerald-500/20 text-emerald-400' },
    PRE: { label: 'Pre', cls: 'bg-blue-500/20 text-blue-400' },
    PREPRE: { label: 'Pre', cls: 'bg-blue-500/20 text-blue-400' },
    POST: { label: 'After', cls: 'bg-purple-500/20 text-purple-400' },
    POSTPOST: { label: 'After', cls: 'bg-purple-500/20 text-purple-400' },
    CLOSED: { label: 'Closed', cls: 'bg-gray-500/20 text-gray-400' },
  };
  const cfg = configs[state] ?? configs.CLOSED;
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${cfg.cls}`}>{cfg.label}</span>
  );
}

export default function StocksTable({ quotes }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-700">
            <th className="text-left py-2 px-3">Symbol</th>
            <th className="text-right py-2 px-3">Price</th>
            <th className="text-right py-2 px-3">Change</th>
            <th className="text-right py-2 px-3">After Hrs</th>
            <th className="text-right py-2 px-3">Ah Chg</th>
            <th className="text-right py-2 px-3 hidden sm:table-cell">Volume</th>
            <th className="text-right py-2 px-3 hidden md:table-cell">52W Range</th>
            <th className="text-center py-2 px-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map(q => {
            const dayPositive = q.regularMarketChangePercent >= 0;
            const hasPost = q.marketState === 'POST' || q.marketState === 'POSTPOST';
            const hasPre = q.marketState === 'PRE' || q.marketState === 'PREPRE';
            const afterPrice = hasPost ? q.postMarketPrice : hasPre ? q.preMarketPrice : null;
            const afterPct = hasPost ? q.postMarketChangePercent : hasPre ? q.preMarketChangePercent : null;
            const afterPositive = (afterPct ?? 0) >= 0;

            const range = q.fiftyTwoWeekHigh - q.fiftyTwoWeekLow;
            const pct52w = range > 0 ? ((q.regularMarketPrice - q.fiftyTwoWeekLow) / range) * 100 : 0;

            return (
              <tr key={q.symbol} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                <td className="py-3 px-3">
                  <div className="font-bold text-white">{q.symbol}</div>
                  <div className="text-xs text-gray-500 truncate max-w-[120px]">{q.shortName}</div>
                </td>
                <td className="py-3 px-3 text-right font-mono font-semibold text-white">
                  {fmt(q.regularMarketPrice)}
                </td>
                <td className={`py-3 px-3 text-right font-mono font-semibold ${dayPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {fmtPct(q.regularMarketChangePercent)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-gray-300">
                  {afterPrice != null ? fmt(afterPrice) : <span className="text-gray-600">—</span>}
                </td>
                <td className={`py-3 px-3 text-right font-mono font-semibold ${afterPct == null ? 'text-gray-600' : afterPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {afterPct != null ? fmtPct(afterPct) : '—'}
                </td>
                <td className="py-3 px-3 text-right text-gray-400 hidden sm:table-cell">
                  {fmtVol(q.regularMarketVolume)}
                </td>
                <td className="py-3 px-3 hidden md:table-cell">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-600 text-xs">{fmt(q.fiftyTwoWeekLow, 0)}</span>
                    <div className="flex-1 bg-gray-700 rounded-full h-1.5 min-w-[60px]">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(0, pct52w))}%` }}
                      />
                    </div>
                    <span className="text-gray-600 text-xs">{fmt(q.fiftyTwoWeekHigh, 0)}</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-center">
                  <MarketStateChip state={q.marketState} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
