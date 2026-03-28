import express from 'express';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

function yahooFetch(url) {
  return new Promise((resolve, reject) => {
    const opts = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    };
    https.get(url, opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Invalid JSON from Yahoo Finance')); }
      });
    }).on('error', reject);
  });
}

// Proxy: quotes
app.get('/api/quotes', async (req, res) => {
  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: 'symbols required' });
  try {
    const fields = [
      'regularMarketPrice', 'regularMarketChange', 'regularMarketChangePercent',
      'regularMarketPreviousClose', 'regularMarketOpen', 'regularMarketDayHigh',
      'regularMarketDayLow', 'regularMarketVolume', 'postMarketPrice',
      'postMarketChange', 'postMarketChangePercent', 'preMarketPrice',
      'preMarketChange', 'preMarketChangePercent', 'marketState', 'shortName',
      'longName', 'fiftyTwoWeekHigh', 'fiftyTwoWeekLow',
    ].join(',');
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}&fields=${fields}&crumb=`;
    const data = await yahooFetch(url);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Proxy: VIX 90-day history
app.get('/api/vix-history', async (req, res) => {
  try {
    const url = 'https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX?interval=1d&range=3mo';
    const data = await yahooFetch(url);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Serve built React app in production
app.use(express.static(path.join(__dirname, 'dist')));
app.get('/{*splat}', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  Market Dashboard running at http://localhost:${PORT}\n`);
});
