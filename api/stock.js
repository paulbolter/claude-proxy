// Vercel serverless function: fetches live stock prices from Yahoo Finance
// Place this file at: api/stock.js in your Vercel proxy GitHub repo
// Endpoint URL: https://claude-proxy-zeta-six.vercel.app/api/stock?symbol=AAPL

export default async function handler(req, res) {
  // Allow your GitHub Pages site (and others) to call this
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const symbol = (req.query.symbol || '').toUpperCase().trim();

  if (!symbol) {
    return res.status(400).json({ error: 'Missing symbol parameter' });
  }

  // Yahoo Finance public quote endpoint
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StockProxy/1.0)'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Yahoo Finance returned ${response.status}` });
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];
    const price = result?.meta?.regularMarketPrice;

    if (typeof price !== 'number') {
      return res.status(404).json({ error: 'Price not found for symbol', symbol });
    }

    return res.status(200).json({
      symbol,
      price,
      currency: result.meta.currency || 'USD',
      timestamp: Date.now()
    });

  } catch (err) {
    return res.status(500).json({ error: 'Fetch failed', message: err.message });
  }
}
