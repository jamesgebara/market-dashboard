import type { Quote, ChartPoint } from '../types/market';

// Seed with current time so data is stable per session but changes on refresh
const seed = Math.floor(Date.now() / 30000);
function seededRandom(n: number) {
  const x = Math.sin(n + seed) * 10000;
  return x - Math.floor(x);
}
function jitter(base: number, pct: number, n: number) {
  return base * (1 + (seededRandom(n) * 2 - 1) * pct);
}

// Determine simulated market state based on ET time
function getMarketState(): Quote['marketState'] {
  const now = new Date();
  // Convert to ET (UTC-4 during DST / UTC-5 otherwise)
  const etOffset = -4; // DST approximation
  const etHour = (now.getUTCHours() + etOffset + 24) % 24;
  const etMin = now.getUTCMinutes();
  const etTime = etHour + etMin / 60;
  const day = now.getUTCDay();
  if (day === 0 || day === 6) return 'CLOSED';
  if (etTime >= 4 && etTime < 9.5) return 'PRE';
  if (etTime >= 9.5 && etTime < 16) return 'REGULAR';
  if (etTime >= 16 && etTime < 20) return 'POST';
  return 'CLOSED';
}

const state = getMarketState();

// Base market data (realistic as of early 2025)
const baseIndices: Omit<Quote, 'marketState'>[] = [
  {
    symbol: '^GSPC', shortName: 'S&P 500',
    regularMarketPrice: jitter(5672, 0.005, 1),
    regularMarketChange: jitter(-18.4, 0.3, 2),
    regularMarketChangePercent: jitter(-0.32, 0.3, 3),
    regularMarketPreviousClose: 5690.4,
    regularMarketOpen: jitter(5685, 0.003, 4),
    regularMarketDayHigh: jitter(5701, 0.002, 5),
    regularMarketDayLow: jitter(5651, 0.002, 6),
    regularMarketVolume: Math.floor(jitter(3800000000, 0.15, 7)),
    postMarketPrice: jitter(5668, 0.002, 8),
    postMarketChange: jitter(-4.2, 0.4, 9),
    postMarketChangePercent: jitter(-0.074, 0.4, 10),
    preMarketPrice: jitter(5681, 0.002, 11),
    preMarketChange: jitter(8.6, 0.4, 12),
    preMarketChangePercent: jitter(0.151, 0.4, 13),
    fiftyTwoWeekHigh: 6147.43,
    fiftyTwoWeekLow: 4953.23,
  },
  {
    symbol: '^IXIC', shortName: 'NASDAQ Composite',
    regularMarketPrice: jitter(17849, 0.006, 20),
    regularMarketChange: jitter(-97.3, 0.3, 21),
    regularMarketChangePercent: jitter(-0.54, 0.3, 22),
    regularMarketPreviousClose: 17946,
    regularMarketOpen: jitter(17930, 0.004, 23),
    regularMarketDayHigh: jitter(17982, 0.003, 24),
    regularMarketDayLow: jitter(17788, 0.003, 25),
    regularMarketVolume: Math.floor(jitter(5200000000, 0.15, 26)),
    postMarketPrice: jitter(17820, 0.003, 27),
    postMarketChange: jitter(-29.1, 0.4, 28),
    postMarketChangePercent: jitter(-0.163, 0.4, 29),
    preMarketPrice: jitter(17901, 0.003, 30),
    preMarketChange: jitter(52.4, 0.4, 31),
    preMarketChangePercent: jitter(0.293, 0.4, 32),
    fiftyTwoWeekHigh: 20204.58,
    fiftyTwoWeekLow: 15222.77,
  },
  {
    symbol: '^DJI', shortName: 'Dow Jones Industrial Average',
    regularMarketPrice: jitter(41873, 0.004, 40),
    regularMarketChange: jitter(134.2, 0.3, 41),
    regularMarketChangePercent: jitter(0.32, 0.3, 42),
    regularMarketPreviousClose: 41739,
    regularMarketOpen: jitter(41742, 0.003, 43),
    regularMarketDayHigh: jitter(41921, 0.002, 44),
    regularMarketDayLow: jitter(41683, 0.002, 45),
    regularMarketVolume: Math.floor(jitter(380000000, 0.15, 46)),
    postMarketPrice: jitter(41900, 0.002, 47),
    postMarketChange: jitter(26.8, 0.4, 48),
    postMarketChangePercent: jitter(0.064, 0.4, 49),
    preMarketPrice: jitter(41832, 0.002, 50),
    preMarketChange: jitter(-41.5, 0.4, 51),
    preMarketChangePercent: jitter(-0.099, 0.4, 52),
    fiftyTwoWeekHigh: 45014,
    fiftyTwoWeekLow: 37122,
  },
  {
    symbol: '^RUT', shortName: 'Russell 2000',
    regularMarketPrice: jitter(2063, 0.007, 60),
    regularMarketChange: jitter(-22.1, 0.3, 61),
    regularMarketChangePercent: jitter(-1.06, 0.3, 62),
    regularMarketPreviousClose: 2085,
    regularMarketOpen: jitter(2079, 0.005, 63),
    regularMarketDayHigh: jitter(2089, 0.003, 64),
    regularMarketDayLow: jitter(2051, 0.003, 65),
    regularMarketVolume: Math.floor(jitter(1100000000, 0.2, 66)),
    postMarketPrice: jitter(2059, 0.003, 67),
    postMarketChange: jitter(-4.1, 0.4, 68),
    postMarketChangePercent: jitter(-0.199, 0.4, 69),
    preMarketPrice: jitter(2071, 0.003, 70),
    preMarketChange: jitter(7.8, 0.4, 71),
    preMarketChangePercent: jitter(0.378, 0.4, 72),
    fiftyTwoWeekHigh: 2466.49,
    fiftyTwoWeekLow: 1816,
  },
  {
    symbol: '^VIX', shortName: 'CBOE Volatility Index',
    regularMarketPrice: jitter(23.4, 0.04, 80),
    regularMarketChange: jitter(2.1, 0.3, 81),
    regularMarketChangePercent: jitter(9.8, 0.3, 82),
    regularMarketPreviousClose: 21.3,
    regularMarketOpen: jitter(21.8, 0.03, 83),
    regularMarketDayHigh: jitter(24.1, 0.02, 84),
    regularMarketDayLow: jitter(21.5, 0.02, 85),
    regularMarketVolume: 0,
    fiftyTwoWeekHigh: 65.73,
    fiftyTwoWeekLow: 10.62,
  },
];

const baseStocks: Omit<Quote, 'marketState'>[] = [
  { symbol: 'AAPL', shortName: 'Apple Inc.', regularMarketPrice: jitter(213.2, 0.01, 100), regularMarketChange: jitter(-2.8, 0.3, 101), regularMarketChangePercent: jitter(-1.3, 0.3, 102), regularMarketPreviousClose: 216, regularMarketOpen: jitter(215, 0.01, 103), regularMarketDayHigh: jitter(215.9, 0.005, 104), regularMarketDayLow: jitter(211.8, 0.005, 105), regularMarketVolume: Math.floor(jitter(72000000, 0.2, 106)), postMarketPrice: jitter(213.8, 0.005, 107), postMarketChange: jitter(0.6, 0.5, 108), postMarketChangePercent: jitter(0.28, 0.5, 109), preMarketPrice: jitter(214.1, 0.005, 110), preMarketChange: jitter(0.9, 0.5, 111), preMarketChangePercent: jitter(0.42, 0.5, 112), fiftyTwoWeekHigh: 260.1, fiftyTwoWeekLow: 164.08 },
  { symbol: 'MSFT', shortName: 'Microsoft Corporation', regularMarketPrice: jitter(388.5, 0.01, 120), regularMarketChange: jitter(3.2, 0.3, 121), regularMarketChangePercent: jitter(0.83, 0.3, 122), regularMarketPreviousClose: 385.3, regularMarketOpen: jitter(386, 0.01, 123), regularMarketDayHigh: jitter(390.2, 0.005, 124), regularMarketDayLow: jitter(384.1, 0.005, 125), regularMarketVolume: Math.floor(jitter(21000000, 0.2, 126)), postMarketPrice: jitter(389.1, 0.005, 127), postMarketChange: jitter(0.6, 0.5, 128), postMarketChangePercent: jitter(0.154, 0.5, 129), preMarketPrice: jitter(387.9, 0.005, 130), preMarketChange: jitter(-0.6, 0.5, 131), preMarketChangePercent: jitter(-0.154, 0.5, 132), fiftyTwoWeekHigh: 468.35, fiftyTwoWeekLow: 361.65 },
  { symbol: 'NVDA', shortName: 'NVIDIA Corporation', regularMarketPrice: jitter(108.3, 0.015, 140), regularMarketChange: jitter(-4.7, 0.3, 141), regularMarketChangePercent: jitter(-4.16, 0.3, 142), regularMarketPreviousClose: 113, regularMarketOpen: jitter(112.2, 0.01, 143), regularMarketDayHigh: jitter(113.8, 0.007, 144), regularMarketDayLow: jitter(107.1, 0.007, 145), regularMarketVolume: Math.floor(jitter(340000000, 0.2, 146)), postMarketPrice: jitter(107.9, 0.007, 147), postMarketChange: jitter(-0.4, 0.5, 148), postMarketChangePercent: jitter(-0.369, 0.5, 149), preMarketPrice: jitter(110.1, 0.007, 150), preMarketChange: jitter(1.8, 0.5, 151), preMarketChangePercent: jitter(1.66, 0.5, 152), fiftyTwoWeekHigh: 153.13, fiftyTwoWeekLow: 66.25 },
  { symbol: 'GOOGL', shortName: 'Alphabet Inc.', regularMarketPrice: jitter(161.8, 0.01, 160), regularMarketChange: jitter(1.4, 0.3, 161), regularMarketChangePercent: jitter(0.87, 0.3, 162), regularMarketPreviousClose: 160.4, regularMarketOpen: jitter(160.9, 0.01, 163), regularMarketDayHigh: jitter(162.7, 0.005, 164), regularMarketDayLow: jitter(159.8, 0.005, 165), regularMarketVolume: Math.floor(jitter(28000000, 0.2, 166)), postMarketPrice: jitter(162.1, 0.005, 167), postMarketChange: jitter(0.3, 0.5, 168), postMarketChangePercent: jitter(0.185, 0.5, 169), preMarketPrice: jitter(161.5, 0.005, 170), preMarketChange: jitter(-0.3, 0.5, 171), preMarketChangePercent: jitter(-0.185, 0.5, 172), fiftyTwoWeekHigh: 207.05, fiftyTwoWeekLow: 140.53 },
  { symbol: 'AMZN', shortName: 'Amazon.com, Inc.', regularMarketPrice: jitter(196.3, 0.01, 180), regularMarketChange: jitter(-1.9, 0.3, 181), regularMarketChangePercent: jitter(-0.96, 0.3, 182), regularMarketPreviousClose: 198.2, regularMarketOpen: jitter(197.8, 0.01, 183), regularMarketDayHigh: jitter(198.6, 0.005, 184), regularMarketDayLow: jitter(195.1, 0.005, 185), regularMarketVolume: Math.floor(jitter(45000000, 0.2, 186)), postMarketPrice: jitter(196.7, 0.005, 187), postMarketChange: jitter(0.4, 0.5, 188), postMarketChangePercent: jitter(0.204, 0.5, 189), preMarketPrice: jitter(197.1, 0.005, 190), preMarketChange: jitter(0.8, 0.5, 191), preMarketChangePercent: jitter(0.407, 0.5, 192), fiftyTwoWeekHigh: 242.52, fiftyTwoWeekLow: 151.61 },
  { symbol: 'META', shortName: 'Meta Platforms, Inc.', regularMarketPrice: jitter(587.4, 0.01, 200), regularMarketChange: jitter(12.3, 0.3, 201), regularMarketChangePercent: jitter(2.14, 0.3, 202), regularMarketPreviousClose: 575.1, regularMarketOpen: jitter(576.2, 0.01, 203), regularMarketDayHigh: jitter(590.8, 0.005, 204), regularMarketDayLow: jitter(574.3, 0.005, 205), regularMarketVolume: Math.floor(jitter(19000000, 0.2, 206)), postMarketPrice: jitter(588.9, 0.005, 207), postMarketChange: jitter(1.5, 0.5, 208), postMarketChangePercent: jitter(0.255, 0.5, 209), preMarketPrice: jitter(585.1, 0.005, 210), preMarketChange: jitter(-2.3, 0.5, 211), preMarketChangePercent: jitter(-0.391, 0.5, 212), fiftyTwoWeekHigh: 740.91, fiftyTwoWeekLow: 414.5 },
  { symbol: 'TSLA', shortName: 'Tesla, Inc.', regularMarketPrice: jitter(272.8, 0.015, 220), regularMarketChange: jitter(-18.4, 0.3, 221), regularMarketChangePercent: jitter(-6.32, 0.3, 222), regularMarketPreviousClose: 291.2, regularMarketOpen: jitter(288.9, 0.01, 223), regularMarketDayHigh: jitter(292.1, 0.007, 224), regularMarketDayLow: jitter(270.3, 0.007, 225), regularMarketVolume: Math.floor(jitter(125000000, 0.2, 226)), postMarketPrice: jitter(273.9, 0.007, 227), postMarketChange: jitter(1.1, 0.5, 228), postMarketChangePercent: jitter(0.403, 0.5, 229), preMarketPrice: jitter(281.5, 0.007, 230), preMarketChange: jitter(8.7, 0.5, 231), preMarketChangePercent: jitter(3.19, 0.5, 232), fiftyTwoWeekHigh: 488.54, fiftyTwoWeekLow: 138.8 },
  { symbol: 'AMD', shortName: 'Advanced Micro Devices, Inc.', regularMarketPrice: jitter(101.2, 0.012, 240), regularMarketChange: jitter(-5.8, 0.3, 241), regularMarketChangePercent: jitter(-5.42, 0.3, 242), regularMarketPreviousClose: 107, regularMarketOpen: jitter(106.1, 0.01, 243), regularMarketDayHigh: jitter(107.3, 0.006, 244), regularMarketDayLow: jitter(100.4, 0.006, 245), regularMarketVolume: Math.floor(jitter(78000000, 0.2, 246)), postMarketPrice: jitter(101.8, 0.006, 247), postMarketChange: jitter(0.6, 0.5, 248), postMarketChangePercent: jitter(0.593, 0.5, 249), preMarketPrice: jitter(103.2, 0.006, 250), preMarketChange: jitter(2.0, 0.5, 251), preMarketChangePercent: jitter(1.976, 0.5, 252), fiftyTwoWeekHigh: 227.3, fiftyTwoWeekLow: 86.19 },
  { symbol: 'SPY', shortName: 'SPDR S&P 500 ETF Trust', regularMarketPrice: jitter(566.4, 0.005, 260), regularMarketChange: jitter(-1.8, 0.3, 261), regularMarketChangePercent: jitter(-0.32, 0.3, 262), regularMarketPreviousClose: 568.2, regularMarketOpen: jitter(567.8, 0.005, 263), regularMarketDayHigh: jitter(569.4, 0.003, 264), regularMarketDayLow: jitter(564.1, 0.003, 265), regularMarketVolume: Math.floor(jitter(65000000, 0.2, 266)), postMarketPrice: jitter(566.1, 0.003, 267), postMarketChange: jitter(-0.3, 0.5, 268), postMarketChangePercent: jitter(-0.053, 0.5, 269), preMarketPrice: jitter(566.9, 0.003, 270), preMarketChange: jitter(0.5, 0.5, 271), preMarketChangePercent: jitter(0.088, 0.5, 272), fiftyTwoWeekHigh: 613.23, fiftyTwoWeekLow: 494.1 },
  { symbol: 'QQQ', shortName: 'Invesco QQQ Trust', regularMarketPrice: jitter(476.2, 0.006, 280), regularMarketChange: jitter(-2.6, 0.3, 281), regularMarketChangePercent: jitter(-0.54, 0.3, 282), regularMarketPreviousClose: 478.8, regularMarketOpen: jitter(478.2, 0.005, 283), regularMarketDayHigh: jitter(479.8, 0.003, 284), regularMarketDayLow: jitter(474.1, 0.003, 285), regularMarketVolume: Math.floor(jitter(42000000, 0.2, 286)), postMarketPrice: jitter(475.9, 0.003, 287), postMarketChange: jitter(-0.3, 0.5, 288), postMarketChangePercent: jitter(-0.063, 0.5, 289), preMarketPrice: jitter(477.1, 0.003, 290), preMarketChange: jitter(0.9, 0.5, 291), preMarketChangePercent: jitter(0.189, 0.5, 292), fiftyTwoWeekHigh: 536.47, fiftyTwoWeekLow: 400.73 },
];

// Generate 90 days of VIX history
export function generateVixHistory(): ChartPoint[] {
  const points: ChartPoint[] = [];
  const now = Date.now();
  const daysBack = 90;
  let vix = 18;
  for (let i = daysBack; i >= 0; i--) {
    const ts = now - i * 86400000;
    const day = new Date(ts).getUTCDay();
    if (day === 0 || day === 6) continue;
    // Random walk with mean reversion
    const noise = (Math.sin(i * 2.3 + seed) + Math.sin(i * 0.7 + seed * 2)) * 1.5;
    vix = vix * 0.95 + 15 * 0.05 + noise;
    vix = Math.max(10, Math.min(45, vix));
    // Spike near idx 20 (simulate a volatility event)
    if (i > 18 && i < 23) vix += 8;
    points.push({ timestamp: ts, close: parseFloat(vix.toFixed(2)) });
  }
  return points;
}

export function getMockIndices(): Quote[] {
  return baseIndices.map(q => ({ ...q, marketState: state }));
}

export function getMockStocks(): Quote[] {
  return baseStocks.map(q => ({ ...q, marketState: state }));
}
