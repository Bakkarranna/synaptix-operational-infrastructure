// Simple development server to handle API routes locally
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3001;

// Enable CORS for development
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // Vite dev server ports
    credentials: true
}));

app.use(express.json());

// Brave Search API endpoint
app.get('/api/brave', async (req, res) => {
    try {
        const query = req.query.q;
        
        if (!query) {
            return res.status(400).json({ error: "Missing query parameter 'q'" });
        }

        console.log(`🔍 Brave API request for query: "${query}"`);

        // Validate API key exists
        if (!process.env.BRAVE_API_KEY) {
            console.error('❌ BRAVE_API_KEY environment variable is not set');
            return res.status(500).json({ error: 'Server configuration error: API key not configured' });
        }

        const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=10`, {
            headers: {
                "Accept": "application/json",
                "X-Subscription-Token": process.env.BRAVE_API_KEY,
            },
        });

        if (!response.ok) {
            console.error(`❌ Brave API error: ${response.status} ${response.statusText}`);
            return res.status(response.status).json({ 
                error: `Failed to fetch from Brave API: ${response.statusText}` 
            });
        }

        const data = await response.json();
        console.log(`✅ Brave API success: ${data.web?.results?.length || 0} results found`);
        
        return res.status(200).json(data);
        
    } catch (error) {
        console.error('❌ Brave API handler error:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        braveApiKey: process.env.BRAVE_API_KEY ? '✅ Configured' : '❌ Missing'
    });
});

app.listen(PORT, () => {
    console.log(`\n🚀 Development API server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔍 Brave Search: http://localhost:${PORT}/api/brave?q=test`);
    console.log(`\n🎯 Environment status:`);
    console.log(`   - BRAVE_API_KEY: ${process.env.BRAVE_API_KEY ? '✅ Loaded' : '❌ Missing'}`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Start Vite dev server: npm run dev (in another terminal)`);
    console.log(`   2. Visit your app and test the AI Link Manager`);
    console.log(`\n🛑 Press Ctrl+C to stop the server\n`);
});