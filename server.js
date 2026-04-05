import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies and URL-encoded data from USSD/SMS providers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Global Request Logger for Debugging on Hostinger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
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
app.all(['/api/ussd', '/api/ussd/'], (req, res) => {
    const { sessionId, serviceCode, phoneNumber, text = '' } = { ...req.query, ...req.body };
    console.log(`USSD Handler: ${req.method} ${req.url} - Text: "${text}" from ${phoneNumber}`);

    let response = '';
    const currentText = (text || '').toString();

    if (currentText === '') {
        response = `CON Welcome to Pameltex Tech Platform\n`;
        response += `1. Check mARI Credit Score\n`;
        response += `2. Apply for Micro-Credit\n`;
        response += `3. Check Weather Forecast\n`;
        response += `4. Ask mARI AI\n`;
        response += `5. View/Respond to Buyer SMS`;
    } else if (currentText === '1') {
        response = `END Your current mARI Credit Score is 745 (Excellent).`;
        sendSMS(phoneNumber, "Your current mARI Credit Score is 745 (Excellent). Keep up the good work!");
    } else if (currentText === '2') {
        response = `END Your application for micro-credit has been received. You will receive an SMS confirmation.`;
        sendSMS(phoneNumber, "Pameltex Tech: Your application for KES 5,000 micro-credit has been received.");
    } else if (currentText === '3') {
        response = `END Weather forecast for your region: Sunny with light showers.`;
        sendSMS(phoneNumber, "Pameltex Tech Weather: Sunny with light showers in the evening.");
    } else if (currentText === '4') {
        response = `CON Ask mARI (AI Advisor):\nType your farming question:`;
    } else if (currentText.startsWith('4*')) {
        response = `END Your message has been sent to our expert agronomists.`;
        sendSMS(phoneNumber, "mARI: Your question has been routed. Expect a reply shortly.");
    } else if (currentText === '5') {
        response = `END You have 1 new message from a Buyer: "Interested in 500kg Maize."`;
        sendSMS(phoneNumber, "Pameltex Tech: New buyer message received. Dial *384*14032*5# to respond.");
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
        sendSMS(from, "Welcome to Pameltex Tech Help. Reply with 'CREDIT', 'WEATHER', or 'MARKET'.");
    }
    res.status(200).send('SMS Received');
});

// 2. Static File Serving (Lower Priority)
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

export default app;
