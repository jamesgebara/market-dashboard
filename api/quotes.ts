import type { VercelRequest, VercelResponse } from '@vercel/node';
import https from 'https';

function yahooFetch(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    }, (res) => {
      let data = '';
      res.on('data', (c: string) => (data += c));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('Invalid JSON from Yahoo Finance')); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

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
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(String(symbols))}&fields=${FIELDS}`;
    const data = await yahooFetch(url);
    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}
