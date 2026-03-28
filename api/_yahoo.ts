import https from 'https';
import type { IncomingMessage } from 'http';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function request(
  url: string,
  headers: Record<string, string> = {},
  maxRedirects = 5,
): Promise<{ body: string; cookies: string[] }> {
  return new Promise((resolve, reject) => {
    const collectedCookies: string[] = [];

    function doGet(currentUrl: string, redirectsLeft: number) {
      const u = new URL(currentUrl);
      const req = https.get(
        { hostname: u.hostname, path: u.pathname + u.search, headers: { 'User-Agent': UA, ...headers } },
        (res: IncomingMessage) => {
          const setCookie = res.headers['set-cookie'] ?? [];
          collectedCookies.push(...setCookie.map(c => c.split(';')[0]));

          if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirectsLeft > 0) {
            const next = res.headers.location.startsWith('http')
              ? res.headers.location
              : `https://${u.hostname}${res.headers.location}`;
            res.resume();
            doGet(next, redirectsLeft - 1);
            return;
          }

          let body = '';
          res.on('data', (c: Buffer) => (body += c));
          res.on('end', () => resolve({ body, cookies: collectedCookies }));
        },
      );
      req.on('error', reject);
      req.end();
    }

    doGet(url, maxRedirects);
  });
}

export async function getYahooSession(): Promise<{ cookie: string; crumb: string }> {
  // Step 1: hit Yahoo Finance to get a session cookie
  const { cookies } = await request('https://finance.yahoo.com/');
  const cookie = cookies.join('; ');

  // Step 2: exchange cookie for a crumb token
  const { body: crumb } = await request(
    'https://query1.finance.yahoo.com/v1/test/getcrumb',
    { Cookie: cookie },
  );

  if (!crumb || crumb.includes('<')) throw new Error('Failed to obtain Yahoo crumb');
  return { cookie, crumb: crumb.trim() };
}

export async function yahooGet(url: string, cookie: string): Promise<unknown> {
  const { body } = await request(url, { Cookie: cookie, Accept: 'application/json' });
  try {
    return JSON.parse(body);
  } catch {
    throw new Error(`Yahoo Finance returned unexpected response: ${body.slice(0, 100)}`);
  }
}
