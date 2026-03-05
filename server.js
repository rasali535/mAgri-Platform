import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// API routes could go here
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.post('/api/chat', async (req, res) => {
    try {
        const { messages, model = "gpt-4o-mini", temperature = 0.7 } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        const completion = await openai.chat.completions.create({
            model,
            messages,
            temperature,
        });

        res.json(completion.choices[0].message);
    } catch (error) {
        console.error('Error calling OpenAI REST API:', error);
        res.status(500).json({ error: 'Failed to process chat request' });
    }
});

// Handle all other routes by serving the index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
