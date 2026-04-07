import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { initBaileys, getQRAsHTML } from './whatsapp/baileys.js';
import { sendSMS as atSendSMS } from './whatsapp/africa.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Baileys once
let baileysStarted = false;

// Middleware to parse JSON bodies and URL-encoded data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Global Request Logger for Debugging on Hostinger
app.use((req, res, next) => {
    console.log(`[mARI API ${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Middleware for CORS (standard for modern browser-based apps)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// USSD Specific Health Check (Plain Text)
app.all(['/api/ussd-health', '/ussd-health', '/ussd-health/'], (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send('CON Health Check OK');
});

// 1. API & USSD Routes
async function sendSMS(to, message) {
    try {
        await atSendSMS(to, message);
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
}

// USSD Bridge Configuration
app.all(['/api/ussd', '/api/ussd/', '/ussd', '/ussd/'], async (req, res) => {
    const { phoneNumber, text = '' } = { ...req.query, ...req.body };
    console.log(`USSD Handler: ${req.method} ${req.url} - Text: "${text}" from ${phoneNumber}`);

    const parts = (text || '').toString().trim().split('*');
    const depth = parts.length;
    const L1 = parts[0];

    let response = '';

    if (text === '' || L1 === '0' || L1 === 'MENU') {
        response = `CON Welcome to mARI Platform\n`;
        response += `1. Check mARI Credit Score\n`;
        response += `2. Apply for Micro-Credit\n`;
        response += `3. Check Weather Forecast\n`;
        response += `4. Ask mARI AI\n`;
        response += `5. View/Respond to Buyer SMS`;
    } else if (L1 === '1') {
        response = `END Your current mARI Credit Score is 745 (Excellent).`;
        sendSMS(phoneNumber, "Your current mARI Credit Score is 745 (Excellent). Keep up the good work!");
    } else if (L1 === '2') {
        response = `END Your application for micro-credit has been received. You will receive an SMS confirmation.`;
        sendSMS(phoneNumber, "mARI Platform: Your application for KES 5,000 micro-credit has been received.");
    } else if (L1 === '3') {
        response = `END Weather forecast for your region: Sunny with light showers.`;
        sendSMS(phoneNumber, "mARI Platform Weather: Sunny with light showers in the evening.");
    } else if (L1 === '4') {
        if (depth === 1) {
            response = `CON Ask mARI (AI Advisor):\nType your farming question:`;
        } else {
            response = `END Your message has been sent to our expert AI advisors.`;
            sendSMS(phoneNumber, "mARI: Your question has been routed to our AI. Expect a reply shortly.");
        }
    } else if (L1 === '5') {
        response = `END You have 1 new message from a Buyer: "Interested in 500kg Maize."`;
        sendSMS(phoneNumber, "mARI Platform: New buyer message received. Dial *384*14032*5# to respond.");
    } else {
        response = `END Invalid option. Please try again.`;
    }

    res.set('Content-Type', 'text/plain');
    res.send(response);
});

// Admin QR Route
app.get('/admin/qr', async (req, res) => {
    try {
        const html = await getQRAsHTML();
        res.status(200).send(html);
    } catch (e) {
        res.status(500).send('Error generating QR');
    }
});

// Diagnostic Route
app.get('/api/info', (req, res) => {
    res.json({
        platform: 'mARI Platform',
        version: '2.5.3',
        node: process.version,
        env: process.env.NODE_ENV,
        cwd: process.cwd(),
        dir: __dirname,
        time: new Date().toISOString(),
        baileys: baileysStarted ? 'online' : 'offline'
    });
});

// AI Services Bridge - Gemini 2.5 Flash
async function askGemini(contents, systemInstruction = "") {
    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) return { error: 'Gemini API not configured' };
    try {
        const body = { contents };
        if (systemInstruction) {
            body.system_instruction = { parts: [{ text: systemInstruction }] };
        }
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!resp.ok) throw new Error(`Gemini API error: ${resp.status}`);
        return await resp.json();
    } catch (error) {
        console.error('Gemini Error:', error);
        throw error;
    }
}

app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        const contents = (messages || []).map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content || m.text }]
        }));
        const systemInstruction = "You are mARI, an AI agronomist for mARI Platform by Pameltex Tech. Be helpful, concise, and professional.";
        const data = await askGemini(contents, systemInstruction);
        res.json({ content: data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.' });
    } catch (e) {
        console.error('[mARI] Chat API Error:', e);
        res.status(500).json({ error: 'Chat service temporarily unavailable' });
    }
});

app.all(['/api/diagnose', '/api/diagnose/'], async (req, res) => {
    console.log(`[Diagnose Hit] Method=${req.method} Path=${req.path}`);
    if (req.method === 'GET' || req.method === 'HEAD') {
        return res.json({ status: 'mARI Platform Diagnosis Endpoint Active' });
    }
    try {
        const { imageBase64, mimeType } = req.body;
        if (!imageBase64 || !mimeType) return res.status(400).json({ error: 'Image data missing' });

        const data = await askGemini([{
            parts: [
                { text: 'Analyze this crop image for diseases. Respond in valid JSON: {"disease": "...", "confidence": 0-100, "recommendation": "..."}' },
                { inline_data: { mime_type: mimeType, data: imageBase64 } }
            ]
        }]);
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return res.json({ disease: 'Healthy Crop', confidence: 100, recommendation: 'No disease detected.' });
        res.json(JSON.parse(jsonMatch[0]));
    } catch (error) {
        console.error('[mARI] Diagnose Error:', error);
        res.status(500).json({ error: 'Failed to process diagnosis' });
    }
});

// 2. Static File Serving (Support both build/ and dist/ folders)
const distPath = path.join(__dirname, 'dist');
const buildPath = path.join(__dirname, 'build');
app.use(express.static(distPath));
app.use(express.static(buildPath));

app.get('*', (req, res) => {
    // Priority 1: dist/index.html
    const distIndex = path.join(distPath, 'index.html');
    const buildIndex = path.join(buildPath, 'index.html');
    const rootIndex = path.join(__dirname, 'index.html'); // fallback
    
    if (path.extname(req.path)) return res.status(404).send('Not Found');
    
    res.sendFile(distIndex, (err) => {
        if (err) {
            res.sendFile(buildIndex, (err2) => {
                if (err2) {
                   res.sendFile(rootIndex, (err3) => {
                        if (err3) res.status(200).send('mARI Platform: Frontend build missing. Run "npm run build".');
                   });
                }
            });
        }
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[mARI] Master Server running on port ${PORT}`);
    if (!baileysStarted) {
        baileysStarted = true;
        initBaileys().catch(e => console.error('[mARI] WhatsApp failed:', e));
    }
});

export default app;
