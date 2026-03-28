import type { Quote, ChartPoint } from '../types/market';

// Seed with current time so small jitter changes on each refresh
const seed = Math.floor(Date.now() / 30000);
function sr(n: number) { const x = Math.sin(n + seed) * 10000; return x - Math.floor(x); }
function jitter(base: number, pct: number, n: number) { return base * (1 + (sr(n) * 2 - 1) * pct); }

function getMarketState(): Quote['marketState'] {
  const now = new Date();
  const etHour = (now.getUTCHours() - 4 + 24) % 24;
  const etTime = etHour + now.getUTCMinutes() / 60;
  const day = now.getUTCDay();
  if (day === 0 || day === 6) return 'CLOSED';
  if (etTime >= 4 && etTime < 9.5) return 'PRE';
  if (etTime >= 9.5 && etTime < 16) return 'REGULAR';
  if (etTime >= 16 && etTime < 20) return 'POST';
  return 'CLOSED';
}

const state = getMarketState();

// Prices accurate as of March 28, 2026
const baseIndices: Omit<Quote, 'marketState'>[] = [
  { symbol: '^GSPC', shortName: 'S&P 500', regularMarketPrice: jitter(6368.85, 0.003, 1), regularMarketChange: jitter(-108.31, 0.1, 2), regularMarketChangePercent: jitter(-1.67, 0.1, 3), regularMarketPreviousClose: 6477.16, regularMarketOpen: jitter(6430, 0.003, 4), regularMarketDayHigh: jitter(6445, 0.002, 5), regularMarketDayLow: jitter(6340, 0.002, 6), regularMarketVolume: Math.floor(jitter(4200000000, 0.1, 7)), postMarketPrice: jitter(6355, 0.002, 8), postMarketChange: jitter(-13.85, 0.2, 9), postMarketChangePercent: jitter(-0.22, 0.2, 10), preMarketPrice: jitter(6380, 0.002, 11), preMarketChange: jitter(11.15, 0.2, 12), preMarketChangePercent: jitter(0.175, 0.2, 13), fiftyTwoWeekHigh: 6147.43, fiftyTwoWeekLow: 4953.23 },
  { symbol: '^IXIC', shortName: 'NASDAQ Composite', regularMarketPrice: jitter(20948.36, 0.003, 20), regularMarketChange: jitter(-459.72, 0.1, 21), regularMarketChangePercent: jitter(-2.15, 0.1, 22), regularMarketPreviousClose: 21408.08, regularMarketOpen: jitter(21200, 0.003, 23), regularMarketDayHigh: jitter(21250, 0.002, 24), regularMarketDayLow: jitter(20850, 0.002, 25), regularMarketVolume: Math.floor(jitter(6100000000, 0.1, 26)), postMarketPrice: jitter(20905, 0.002, 27), postMarketChange: jitter(-43.36, 0.2, 28), postMarketChangePercent: jitter(-0.207, 0.2, 29), preMarketPrice: jitter(20985, 0.002, 30), preMarketChange: jitter(36.64, 0.2, 31), preMarketChangePercent: jitter(0.175, 0.2, 32), fiftyTwoWeekHigh: 20204.58, fiftyTwoWeekLow: 15222.77 },
  { symbol: '^DJI', shortName: 'Dow Jones Industrial Average', regularMarketPrice: jitter(45166.64, 0.002, 40), regularMarketChange: jitter(-793.47, 0.1, 41), regularMarketChangePercent: jitter(-1.73, 0.1, 42), regularMarketPreviousClose: 45960.11, regularMarketOpen: jitter(45800, 0.002, 43), regularMarketDayHigh: jitter(45900, 0.002, 44), regularMarketDayLow: jitter(45050, 0.002, 45), regularMarketVolume: Math.floor(jitter(420000000, 0.1, 46)), postMarketPrice: jitter(45210, 0.002, 47), postMarketChange: jitter(43.36, 0.2, 48), postMarketChangePercent: jitter(0.096, 0.2, 49), preMarketPrice: jitter(45100, 0.002, 50), preMarketChange: jitter(-66.64, 0.2, 51), preMarketChangePercent: jitter(-0.147, 0.2, 52), fiftyTwoWeekHigh: 45014, fiftyTwoWeekLow: 37122 },
  { symbol: '^RUT', shortName: 'Russell 2000', regularMarketPrice: jitter(2449.70, 0.004, 60), regularMarketChange: jitter(-43.63, 0.1, 61), regularMarketChangePercent: jitter(-1.75, 0.1, 62), regularMarketPreviousClose: 2493.33, regularMarketOpen: jitter(2480, 0.003, 63), regularMarketDayHigh: jitter(2490, 0.002, 64), regularMarketDayLow: jitter(2435, 0.002, 65), regularMarketVolume: Math.floor(jitter(1400000000, 0.15, 66)), postMarketPrice: jitter(2445, 0.003, 67), postMarketChange: jitter(-4.7, 0.2, 68), postMarketChangePercent: jitter(-0.192, 0.2, 69), preMarketPrice: jitter(2455, 0.003, 70), preMarketChange: jitter(5.3, 0.2, 71), preMarketChangePercent: jitter(0.216, 0.2, 72), fiftyTwoWeekHigh: 2466.49, fiftyTwoWeekLow: 1816 },
  { symbol: '^VIX', shortName: 'CBOE Volatility Index', regularMarketPrice: jitter(31.05, 0.02, 80), regularMarketChange: jitter(3.61, 0.1, 81), regularMarketChangePercent: jitter(13.16, 0.1, 82), regularMarketPreviousClose: 27.44, regularMarketOpen: jitter(28.1, 0.02, 83), regularMarketDayHigh: jitter(32.4, 0.02, 84), regularMarketDayLow: jitter(27.8, 0.02, 85), regularMarketVolume: 0, fiftyTwoWeekHigh: 65.73, fiftyTwoWeekLow: 10.62 },
];

const baseStocks: Omit<Quote, 'marketState'>[] = [
  { symbol: 'AAPL', shortName: 'Apple Inc.', regularMarketPrice: jitter(248.80, 0.008, 100), regularMarketChange: jitter(-2.78, 0.1, 101), regularMarketChangePercent: jitter(-1.1, 0.1, 102), regularMarketPreviousClose: 251.58, regularMarketOpen: jitter(250.5, 0.005, 103), regularMarketDayHigh: jitter(252.1, 0.004, 104), regularMarketDayLow: jitter(247.2, 0.004, 105), regularMarketVolume: Math.floor(jitter(68000000, 0.15, 106)), postMarketPrice: jitter(249.2, 0.004, 107), postMarketChange: jitter(0.4, 0.3, 108), postMarketChangePercent: jitter(0.16, 0.3, 109), preMarketPrice: jitter(249.5, 0.004, 110), preMarketChange: jitter(0.7, 0.3, 111), preMarketChangePercent: jitter(0.28, 0.3, 112), fiftyTwoWeekHigh: 260.1, fiftyTwoWeekLow: 164.08 },
  { symbol: 'MSFT', shortName: 'Microsoft Corporation', regularMarketPrice: jitter(404.00, 0.008, 120), regularMarketChange: jitter(4.52, 0.1, 121), regularMarketChangePercent: jitter(1.13, 0.1, 122), regularMarketPreviousClose: 399.48, regularMarketOpen: jitter(400.5, 0.005, 123), regularMarketDayHigh: jitter(405.8, 0.004, 124), regularMarketDayLow: jitter(399.1, 0.004, 125), regularMarketVolume: Math.floor(jitter(24000000, 0.15, 126)), postMarketPrice: jitter(404.5, 0.004, 127), postMarketChange: jitter(0.5, 0.3, 128), postMarketChangePercent: jitter(0.124, 0.3, 129), preMarketPrice: jitter(403.2, 0.004, 130), preMarketChange: jitter(-0.8, 0.3, 131), preMarketChangePercent: jitter(-0.198, 0.3, 132), fiftyTwoWeekHigh: 468.35, fiftyTwoWeekLow: 361.65 },
  { symbol: 'NVDA', shortName: 'NVIDIA Corporation', regularMarketPrice: jitter(176.32, 0.01, 140), regularMarketChange: jitter(1.47, 0.1, 141), regularMarketChangePercent: jitter(0.84, 0.1, 142), regularMarketPreviousClose: 174.85, regularMarketOpen: jitter(175.1, 0.007, 143), regularMarketDayHigh: jitter(177.9, 0.005, 144), regularMarketDayLow: jitter(173.8, 0.005, 145), regularMarketVolume: Math.floor(jitter(310000000, 0.15, 146)), postMarketPrice: jitter(176.8, 0.005, 147), postMarketChange: jitter(0.48, 0.3, 148), postMarketChangePercent: jitter(0.272, 0.3, 149), preMarketPrice: jitter(177.1, 0.005, 150), preMarketChange: jitter(0.78, 0.3, 151), preMarketChangePercent: jitter(0.442, 0.3, 152), fiftyTwoWeekHigh: 153.13, fiftyTwoWeekLow: 66.25 },
  { symbol: 'GOOGL', shortName: 'Alphabet Inc.', regularMarketPrice: jitter(171.50, 0.008, 160), regularMarketChange: jitter(-2.1, 0.1, 161), regularMarketChangePercent: jitter(-1.21, 0.1, 162), regularMarketPreviousClose: 173.6, regularMarketOpen: jitter(173.0, 0.005, 163), regularMarketDayHigh: jitter(174.2, 0.004, 164), regularMarketDayLow: jitter(170.8, 0.004, 165), regularMarketVolume: Math.floor(jitter(32000000, 0.15, 166)), postMarketPrice: jitter(171.8, 0.004, 167), postMarketChange: jitter(0.3, 0.3, 168), postMarketChangePercent: jitter(0.175, 0.3, 169), preMarketPrice: jitter(171.2, 0.004, 170), preMarketChange: jitter(-0.3, 0.3, 171), preMarketChangePercent: jitter(-0.175, 0.3, 172), fiftyTwoWeekHigh: 207.05, fiftyTwoWeekLow: 140.53 },
  { symbol: 'AMZN', shortName: 'Amazon.com, Inc.', regularMarketPrice: jitter(211.40, 0.008, 180), regularMarketChange: jitter(-4.8, 0.1, 181), regularMarketChangePercent: jitter(-2.22, 0.1, 182), regularMarketPreviousClose: 216.2, regularMarketOpen: jitter(215.0, 0.005, 183), regularMarketDayHigh: jitter(215.9, 0.004, 184), regularMarketDayLow: jitter(210.5, 0.004, 185), regularMarketVolume: Math.floor(jitter(52000000, 0.15, 186)), postMarketPrice: jitter(211.8, 0.004, 187), postMarketChange: jitter(0.4, 0.3, 188), postMarketChangePercent: jitter(0.189, 0.3, 189), preMarketPrice: jitter(212.1, 0.004, 190), preMarketChange: jitter(0.7, 0.3, 191), preMarketChangePercent: jitter(0.331, 0.3, 192), fiftyTwoWeekHigh: 242.52, fiftyTwoWeekLow: 151.61 },
  { symbol: 'META', shortName: 'Meta Platforms, Inc.', regularMarketPrice: jitter(620.30, 0.008, 200), regularMarketChange: jitter(-14.2, 0.1, 201), regularMarketChangePercent: jitter(-2.24, 0.1, 202), regularMarketPreviousClose: 634.5, regularMarketOpen: jitter(632.0, 0.005, 203), regularMarketDayHigh: jitter(634.8, 0.004, 204), regularMarketDayLow: jitter(617.1, 0.004, 205), regularMarketVolume: Math.floor(jitter(22000000, 0.15, 206)), postMarketPrice: jitter(621.1, 0.004, 207), postMarketChange: jitter(0.8, 0.3, 208), postMarketChangePercent: jitter(0.129, 0.3, 209), preMarketPrice: jitter(619.5, 0.004, 210), preMarketChange: jitter(-0.8, 0.3, 211), preMarketChangePercent: jitter(-0.129, 0.3, 212), fiftyTwoWeekHigh: 740.91, fiftyTwoWeekLow: 414.5 },
  { symbol: 'TSLA', shortName: 'Tesla, Inc.', regularMarketPrice: jitter(386.33, 0.01, 220), regularMarketChange: jitter(9.88, 0.1, 221), regularMarketChangePercent: jitter(2.62, 0.1, 222), regularMarketPreviousClose: 376.45, regularMarketOpen: jitter(378.0, 0.007, 223), regularMarketDayHigh: jitter(389.5, 0.005, 224), regularMarketDayLow: jitter(375.8, 0.005, 225), regularMarketVolume: Math.floor(jitter(110000000, 0.15, 226)), postMarketPrice: jitter(387.1, 0.005, 227), postMarketChange: jitter(0.77, 0.3, 228), postMarketChangePercent: jitter(0.199, 0.3, 229), preMarketPrice: jitter(388.5, 0.005, 230), preMarketChange: jitter(2.17, 0.3, 231), preMarketChangePercent: jitter(0.561, 0.3, 232), fiftyTwoWeekHigh: 488.54, fiftyTwoWeekLow: 138.8 },
  { symbol: 'AMD', shortName: 'Advanced Micro Devices, Inc.', regularMarketPrice: jitter(118.50, 0.01, 240), regularMarketChange: jitter(-3.2, 0.1, 241), regularMarketChangePercent: jitter(-2.63, 0.1, 242), regularMarketPreviousClose: 121.7, regularMarketOpen: jitter(121.0, 0.007, 243), regularMarketDayHigh: jitter(122.1, 0.005, 244), regularMarketDayLow: jitter(117.8, 0.005, 245), regularMarketVolume: Math.floor(jitter(85000000, 0.15, 246)), postMarketPrice: jitter(118.9, 0.005, 247), postMarketChange: jitter(0.4, 0.3, 248), postMarketChangePercent: jitter(0.337, 0.3, 249), preMarketPrice: jitter(119.2, 0.005, 250), preMarketChange: jitter(0.7, 0.3, 251), preMarketChangePercent: jitter(0.59, 0.3, 252), fiftyTwoWeekHigh: 227.3, fiftyTwoWeekLow: 86.19 },
  { symbol: 'SPY', shortName: 'SPDR S&P 500 ETF Trust', regularMarketPrice: jitter(634.20, 0.003, 260), regularMarketChange: jitter(-10.8, 0.1, 261), regularMarketChangePercent: jitter(-1.67, 0.1, 262), regularMarketPreviousClose: 645.0, regularMarketOpen: jitter(641.5, 0.003, 263), regularMarketDayHigh: jitter(643.2, 0.002, 264), regularMarketDayLow: jitter(632.1, 0.002, 265), regularMarketVolume: Math.floor(jitter(82000000, 0.15, 266)), postMarketPrice: jitter(633.8, 0.002, 267), postMarketChange: jitter(-0.4, 0.3, 268), postMarketChangePercent: jitter(-0.063, 0.3, 269), preMarketPrice: jitter(634.9, 0.002, 270), preMarketChange: jitter(0.7, 0.3, 271), preMarketChangePercent: jitter(0.11, 0.3, 272), fiftyTwoWeekHigh: 613.23, fiftyTwoWeekLow: 494.1 },
  { symbol: 'QQQ', shortName: 'Invesco QQQ Trust', regularMarketPrice: jitter(512.80, 0.004, 280), regularMarketChange: jitter(-11.2, 0.1, 281), regularMarketChangePercent: jitter(-2.14, 0.1, 282), regularMarketPreviousClose: 524.0, regularMarketOpen: jitter(521.0, 0.003, 283), regularMarketDayHigh: jitter(522.5, 0.002, 284), regularMarketDayLow: jitter(510.9, 0.002, 285), regularMarketVolume: Math.floor(jitter(58000000, 0.15, 286)), postMarketPrice: jitter(512.4, 0.002, 287), postMarketChange: jitter(-0.4, 0.3, 288), postMarketChangePercent: jitter(-0.078, 0.3, 289), preMarketPrice: jitter(513.5, 0.002, 290), preMarketChange: jitter(0.7, 0.3, 291), preMarketChangePercent: jitter(0.137, 0.3, 292), fiftyTwoWeekHigh: 536.47, fiftyTwoWeekLow: 400.73 },
];

export function generateVixHistory(): ChartPoint[] {
  const points: ChartPoint[] = [];
  const now = Date.now();
  let vix = 18;
  for (let i = 90; i >= 0; i--) {
    const ts = now - i * 86400000;
    const day = new Date(ts).getUTCDay();
    if (day === 0 || day === 6) continue;
    const noise = (Math.sin(i * 2.3 + seed) + Math.sin(i * 0.7 + seed * 2)) * 1.5;
    vix = vix * 0.95 + 18 * 0.05 + noise;
    // Recent spike toward 31
    if (i < 10) vix = vix * 0.85 + 31 * 0.15;
    vix = Math.max(10, Math.min(50, vix));
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
