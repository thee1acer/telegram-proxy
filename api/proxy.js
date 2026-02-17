// Vercel Serverless Function (Node.js)
// Proxies fetch requests to bypass firewalls
export default async function handler(req, res) {

  // 1. Set CORS headers to allow requests from anywhere (like your trading bot)
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  // 2. Handle the "Preflight" OPTIONS request (standard for cross-origin requests)
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // 3. Get the target URL (Telegram API) from the query string
  // The C# bot sends: ?url=https://api.telegram.org/bot...
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: "Missing 'url' query parameter. Usage: /api/proxy?url=YOUR_TARGET_URL" });
  }

  try {
    // 4. Forward the request to Telegram
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Pass the exact JSON body from the bot (chat_id, text, etc.)
      body: JSON.stringify(req.body),
    });

    // 5. Return Telegram's response back to the bot
    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
