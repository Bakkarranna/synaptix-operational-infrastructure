// Vercel Serverless Function for Brave Search API
// This file will be deployed as a serverless function on Vercel

export default async function handler(req, res) {
  // Enable CORS for your domain
  res.setHeader('Access-Control-Allow-Origin', 'https://www.synaptixstudio.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const query = req.query.q;
    
    if (!query) {
      return res.status(400).json({ error: "Missing query parameter 'q'" });
    }

    // Validate API key exists
    if (!process.env.BRAVE_API_KEY) {
      console.error('BRAVE_API_KEY environment variable is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=10`, {
      headers: {
        "Accept": "application/json",
        "X-Subscription-Token": process.env.BRAVE_API_KEY,
      },
    });

    if (!response.ok) {
      console.error(`Brave API error: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({ 
        error: `Failed to fetch from Brave API: ${response.statusText}` 
      });
    }

    const data = await response.json();
    
    // Return the search results
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Brave API handler error:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
}