import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getYahooSession, yahooGet } from './_yahoo';

const FIELDS = [
  'regularMarketPrice', 'regularMarketChange', 'regularMarketChangePercent',
  'regularMarketPreviousClose', 'regularMarketOpen', 'regularMarketDayHigh',
  'regularMarketDayLow', 'regularMarketVolume', 'postMarketPrice',
  'postMarketChange', 'postMarketChangePercent', 'preMarketPrice',
  'preMarketChange', 'preMarketChangePercent', 'marketState', 'shortName',
  'longName', 'fiftyTwoWeekHigh', 'fiftyTwoWeekLow',
].join(',');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: 'symbols required' });

  try {
    const { cookie, crumb } = await getYahooSession();
    const symbolList = String(symbols).split(',').map(s => encodeURIComponent(s.trim())).join(',');
    const url =
      `https://query1.finance.yahoo.com/v7/finance/quote` +
      `?symbols=${symbolList}&fields=${FIELDS}&crumb=${encodeURIComponent(crumb)}`;

    const data = await yahooGet(url, cookie);
    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}
