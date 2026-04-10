import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
// import OpenAI from 'openai'; - Unused now using Gemini

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// WhatsApp & Baileys Integrations
import { initBaileys, getQRAsHTML } from './whatsapp/baileys.js';
import { sendSMS as atSendSMS } from './whatsapp/africa.js';
import { askGemini } from './services/ai.js';

// Initialize Baileys once (but it will be called in app.listen)
let baileysStarted = false;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies and URL-encoded data from USSD/SMS providers
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

// USSD Specific Health Check (Plain Text) - PRIORITY 1
app.get('/api/ussd-health', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send('CON Health Check OK');
});

// 1. API & USSD Routes (High Priority)
// Helper function to send SMS via Africa's Talking
async function sendSMS(to, message) {
    const username = process.env.AT_USERNAME || 'sandbox';
    const apiKey = process.env.AT_API_KEY;

    if (!apiKey) {
        console.log(`[SIMULATED SMS to ${to}]: ${message}`);
        return;
    }

    try {
        const response = await fetch('https://api.africastalking.com/version1/messaging', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'apiKey': apiKey
            },
            body: new URLSearchParams({
                'username': username,
                'to': to,
                'message': message
            })
        });
        const data = await response.json();
        console.log('SMS sent successfully:', data);
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
}

// Global USSD Detector - Redirects USSD requests that accidentally hit the root
app.use((req, res, next) => {
    const isUSSD = req.body.sessionId || req.query.sessionId || req.body.phoneNumber || req.query.phoneNumber;
    if (isUSSD && !req.path.startsWith('/api/')) {
        console.log(`USSD Detection: Routing ${req.method} ${req.path} to /api/ussd`);
        req.url = '/api/ussd';
    }
    next();
});

// USSD & SMS Bridge Configuration
app.all(['/api/ussd', '/api/ussd/'], async (req, res) => {
    const { phoneNumber, text = '' } = { ...req.query, ...req.body };
    console.log(`USSD Handler: ${req.method} ${req.url} - Text: "${text}" from ${phoneNumber}`);

    const parts = (text || '').toString().trim().split('*');
    const depth = parts.length;
    const L1 = parts[0];

    // Simple language prefix normalization (since server.js doesn't have the same translations structure, we'll keep it simple)
    const possibleLangs = ['1', '2', '3', '4', '5'];
    let effectiveParts = parts;
    // Assume if depth >= 2 and L1=1, it might be English prefix from index.js session
    if (depth >= 2 && possibleLangs.includes(L1)) {
        effectiveParts = parts.slice(1);
    }

    const eDepth = effectiveParts.length;
    const eL1 = effectiveParts[0];
    const eL2 = effectiveParts[1];

    let response = '';

    if (text === '' || eL1 === '0' || eL1 === 'MENU') {
        response = `CON 🌱 *mARI Tech Platform*\n`;
        response += `1. Dashboard\n`;
        response += `2. Marketplace\n`;
        response += `3. Crop Scan (Info)\n`;
        response += `4. Ask mARI (AI Advisor)\n`;
        response += `5. Finance & Credit\n`;
        response += `6. Weather Forecast\n`;
        response += `7. Farmer Community\n`;
        response += `8. Vuka Social\n`;
        response += `9. Language\n`;
        response += `10. Mpotsa Q&A\n`;
        response += `📅 ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else if (eL1 === '1') {
        response = `END Your current mARI Credit Score is 745 (Excellent).`;
        sendSMS(phoneNumber, "Your current mARI Credit Score is 745 (Excellent). Keep up the good work!");
    } else if (eL1 === '2') {
        response = `END Your application for micro-credit has been received. You will receive an SMS confirmation.`;
        sendSMS(phoneNumber, "mARI Platform: Your application for KES 5,000 micro-credit has been received.");
    } else if (eL1 === '3') {
        response = `END Weather forecast for your region: Sunny with light showers.`;
        sendSMS(phoneNumber, "mARI Platform Weather: Sunny with light showers in the evening.");
    } else if (eL1 === '4') {
        if (eDepth === 1) {
            response = `CON Ask mARI (AI Advisor):\nType your farming question:`;
        } else {
            response = `END Your message has been sent to our expert AI advisors.`;
            sendSMS(phoneNumber, "mARI: Your question has been routed to our AI. Expect a reply shortly.");
        }
    } else if (eL1 === '5') {
        response = `END You have 1 new message from a Buyer: "Interested in 500kg Maize."`;
        sendSMS(phoneNumber, "mARI Platform: New buyer message received. Dial *384*14032*5# to respond.");
    } else {
        response = `END Invalid option. Please try again.`;
    }

    res.set('Content-Type', 'text/plain');
    res.send(response);
});

app.post('/api/sms', (req, res) => {
    const { from, text } = { ...req.query, ...req.body };
    console.log(`SMS Received: from ${from}: ${text}`);
    if (text && text.toLowerCase().includes('help')) {
        sendSMS(from, "Welcome to mARI Platform Help. Reply with 'CREDIT', 'WEATHER', or 'MARKET'.");
    }
    res.status(200).send('SMS Received');
});

// 2. Static File Serving (Lower Priority)
app.use(express.static(path.join(__dirname, 'dist')));
// Using centralized askGemini from services/ai.js imported at top of file

app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        const contents = messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));

        const systemInstruction = "You are mARI, a premium AI agronomist for the mARI Platform, developed by Pameltex Tech. Provide helpful agricultural advice.";
        const answer = await askGemini(contents, systemInstruction);
        res.json({ role: 'assistant', content: answer });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process chat request' });
    }
});

app.all(['/api/diagnose', '/api/diagnose/'], async (req, res) => {
    console.log(`[Diagnose API Intercepted] ${req.method} ${req.path}`);
    
    // Handle status checks or standard GET browser hits
    if (req.method === 'GET' || req.method === 'HEAD') {
        return res.json({ 
            status: 'mARI Platform Diagnosis Endpoint Active', 
            methods: ['POST'],
            current_date: new Date().toISOString()
        });
    }

    try {
        const { imageBase64, mimeType } = req.body;
        if (!imageBase64 || !mimeType) {
            console.warn('[Diagnose API] Missing image data in POST');
            return res.status(400).json({ error: 'Image and mimeType are required' });
        }

        console.log(`[Diagnose API] Forwarding to Gemini Vision (Mime: ${mimeType})...`);
        const data = await askGemini([{
            parts: [
                { text: 'You are mARI, an expert agronomist AI. Analyze the crop image for diseases. Respond in valid JSON exactly: {"disease": "...", "confidence": 0-100, "recommendation": "..."}' },
                { inline_data: { mime_type: mimeType, data: imageBase64 } }
            ]
        }]);

        let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('No JSON block found in AI response:', text);
            return res.status(500).json({ error: 'AI returned invalid output format' });
        }
        
        try {
            const parsed = JSON.parse(jsonMatch[0]);
            res.json(parsed);
        } catch (e) {
            console.error('Invalid AI JSON parse error:', e.message, 'Text:', text);
            res.status(500).json({ error: 'AI returned invalid JSON content' });
        }
    } catch (error) {
        console.error('[Diagnose API] Global Error:', error);
        res.status(500).json({ error: 'Failed to process diagnosis' });
    }
});

// -- Admin QR Route --
app.get('/admin/qr', async (req, res) => {
    try {
        const html = await getQRAsHTML();
        res.status(200).send(html);
    } catch (e) {
        res.status(500).send('Error generating QR');
    }
});

app.get('/api/info', (req, res) => {
    res.json({
        platform: 'mARI Platform',
        version: '2.5.1',
        node: process.version,
        env: process.env.NODE_ENV,
        cwd: process.cwd(),
        dir: __dirname,
        time: new Date().toISOString()
    });
});

// Handle all other routes by serving the index.html file
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    const altPath = path.join(__dirname, 'index.html');
    if (path.extname(req.path)) return res.status(404).send('Not Found');
    res.sendFile(indexPath, (err) => {
        if (err) res.sendFile(altPath);
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server (mARI Platform) is running on port ${PORT}`);
    if (!baileysStarted) {
        baileysStarted = true;
        initBaileys().catch(e => console.error('[MASTER] Baileys init failed:', e));
    }
});

export default app;
