export interface Quote {
  symbol: string;
  shortName: string;
  longName?: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketPreviousClose: number;
  regularMarketOpen: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  postMarketPrice?: number;
  postMarketChange?: number;
  postMarketChangePercent?: number;
  preMarketPrice?: number;
  preMarketChange?: number;
  preMarketChangePercent?: number;
  marketState: 'REGULAR' | 'PRE' | 'POST' | 'CLOSED' | 'PREPRE' | 'POSTPOST';
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
}

export interface ChartPoint {
  timestamp: number;
  close: number;
}

export interface MarketData {
  indices: Quote[];
  stocks: Quote[];
  vixHistory: ChartPoint[];
  lastUpdated: Date;
}
