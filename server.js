import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from root directory
app.use(express.static(__dirname));

// Serve index.html at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Gemini AI Chat API Endpoint
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

app.post('/api/chat', async (req, res) => {
    try {
        if (!GEMINI_API_KEY) {
            return res.status(500).json({ reply: "GEMINI_API_KEY is missing in Render Environment Variables!" });
        }

        const { prompt } = req.body;

        const systemPrompt = `You are a location assistant for Spotly, embedded in Kottayam town, Kerala. 
        Focus strictly on recommending cafes, biriyani spots (like Nahdi Kuzhimandi, Calicut Cafe), 
        and hangouts. Answer casually and keep it under 3 sentences. User question: ${prompt}`;

        // Updated model endpoint
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Google API Error:", data.error);
            return res.status(500).json({ reply: `Gemini Error: ${data.error.message || "Invalid request"}` });
        }

        const botReply = data.candidates[0].content.parts[0].text;
        res.json({ reply: botReply });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ reply: "Sorry, the network is too congested right now!" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Spotly API listening on port ${PORT}`);
});
