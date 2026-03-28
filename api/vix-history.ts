import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getYahooSession, yahooGet } from './_yahoo';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const { cookie, crumb } = await getYahooSession();
    const url =
      `https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX` +
      `?interval=1d&range=3mo&crumb=${encodeURIComponent(crumb)}`;

    const data = await yahooGet(url, cookie);
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}
