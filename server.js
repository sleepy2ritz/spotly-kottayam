// server.js (Node.js Backend for Google Cloud Run)
// This securely holds the Gemini API Key and communicates with the frontend.
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

// Set this environment variable in your Cloud Run settings
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

app.post('/api/chat', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        // System instructions to keep Gemini focused on Kottayam Gen-Z spots
        const systemPrompt = `You are a location assistant for Spotly, embedded in Kottayam town, Kerala. 
        Focus strictly on recommending cafes, biriyani spots (like Nahdi Kuzhimandi, Calicut Cafe), 
        and hangouts. Answer casually and keep it under 3 sentences. User question: ${prompt}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            return res.status(500).json({ reply: "API Key error or quota exceeded." });
        }

        const botReply = data.candidates[0].content.parts[0].text;
        res.json({ reply: botReply });
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ reply: "Sorry, the network is too congested right now!" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Spotly Cloud Run API listening on port ${PORT}`);
});
