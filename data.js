// Vercel serverless function — talks to Upstash Redis
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const UPSTASH_URL   = process.env.UPSTASH_REDIS_REST_URL;
  const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return res.status(500).json({ error: 'Missing Upstash env vars' });
  }

  const headers = {
    Authorization: `Bearer ${UPSTASH_TOKEN}`,
    'Content-Type': 'application/json',
  };

  try {
    if (req.method === 'GET') {
      const key = req.query.key;
      const r = await fetch(`${UPSTASH_URL}/get/${encodeURIComponent(key)}`, { headers });
      const d = await r.json();
      return res.status(200).json({ value: d.result });
    }

    if (req.method === 'POST') {
      const { key, value } = req.body;
      await fetch(`${UPSTASH_URL}/set/${encodeURIComponent(key)}`, {
        method: 'POST', headers,
        body: JSON.stringify(value),
      });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
