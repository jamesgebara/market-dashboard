import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { ChartPoint } from '../types/market';

interface Props {
  data: ChartPoint[];
  currentVix?: number;
}

function vixColor(value: number) {
  if (value < 15) return '#34d399';
  if (value < 20) return '#60a5fa';
  if (value < 30) return '#facc15';
  if (value < 40) return '#fb923c';
  return '#f87171';
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  const date = new Date(label);
  return (
    <div className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="text-gray-400 mb-1">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
      <div className="text-white font-bold text-sm">VIX: <span style={{ color: vixColor(val) }}>{val?.toFixed(2)}</span></div>
    </div>
  );
};

export default function VolatilityChart({ data, currentVix }: Props) {
  if (!data.length) return (
    <div className="h-48 flex items-center justify-center text-gray-500 text-sm">No chart data</div>
  );

  const chartData = data.map(p => ({ time: p.timestamp, value: parseFloat(p.close.toFixed(2)) }));
  const latestVal = currentVix ?? data[data.length - 1]?.close ?? 0;
  const color = vixColor(latestVal);

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="vixGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            type="number"
            domain={['dataMin', 'dataMax']}
            scale="time"
            tickFormatter={(t) => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={60}
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={20} stroke="#374151" strokeDasharray="3 3" />
          <ReferenceLine y={30} stroke="#374151" strokeDasharray="3 3" />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill="url(#vixGradient)"
            dot={false}
            activeDot={{ r: 4, fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2 text-xs text-gray-500 px-2">
        <span className="flex items-center gap-1"><span className="w-6 border-t border-dashed border-gray-600 inline-block"></span>20 (Elevated)</span>
        <span className="flex items-center gap-1"><span className="w-6 border-t border-dashed border-gray-600 inline-block"></span>30 (High)</span>
      </div>
    </div>
  );
}
