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

app.get('/', (req, res) => {
    res.send('mAgri Platform Node Server - Operational');
});

// Legacy /api/ussd for backward compatibility
app.all(['/api/ussd', '/api/ussd/'], (req, res) => {
    res.redirect(307, '/ussd');
});

// Diagnostic route to see what URL Express is receiving
app.all('/index.js', (req, res) => {
    const originalUrl = req.headers['x-original-uri'] || req.url;

    res.json({
        msg: "Intercepted by /index.js handler",
        reqUrl: req.url,
        originalUrl: originalUrl,
        headers: req.headers
    });
});

// USSD Specific Health Check (Plain Text) - PRIORITY 1
app.all(['/ussd-health', '/ussd-health/'], (req, res) => {
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
app.all(['/ussd', '/ussd/'], (req, res) => {
    const { sessionId, serviceCode, phoneNumber, text = '' } = { ...req.query, ...req.body };
    console.log(`USSD Handler: ${req.method} ${req.url} - Text: "${text}" from ${phoneNumber}`);

    let response = '';
    const currentText = (text || '').toString();

    if (currentText === '') {
        response = `CON Welcome to mAgri Platform\n`;
        response += `1. Check Credit Score\n`;
        response += `2. Apply for Micro-Credit\n`;
        response += `3. Check Weather Forecast\n`;
        response += `4. SMS Agronomist\n`;
        response += `5. View/Respond to Buyer SMS`;
    } else if (currentText === '1') {
        response = `END Your current mAgri Credit Score is 745 (Excellent).`;
        sendSMS(phoneNumber, "Your current mAgri Credit Score is 745 (Excellent). Keep up the good work!");
    } else if (currentText === '2') {
        response = `END Your application for KES 5,000 micro-credit has been received. You will receive an SMS confirmation.`;
        sendSMS(phoneNumber, "mAgri Alert: Your application for KES 5,000 micro-credit has been received.");
    } else if (currentText === '3') {
        response = `END Weather forecast for your region: Sunny with light showers.`;
        sendSMS(phoneNumber, "mAgri Weather: Sunny with light showers in the evening.");
    } else if (currentText === '4') {
        response = `CON Please type your question for the agronomist:`;
    } else if (currentText.startsWith('4*')) {
        response = `END Your message has been sent to our expert agronomists.`;
        sendSMS(phoneNumber, "mAgri: Your question has been routed. Expect a reply shortly.");
    } else if (currentText === '5') {
        response = `END You have 1 new message from a Buyer: "Interested in 500kg Maize."`;
        sendSMS(phoneNumber, "mAgri Buyer Alert: New message received. Dial *384*14032*5# to respond.");
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
        sendSMS(from, "Welcome to mAgri Help. Reply with 'CREDIT', 'WEATHER', or 'MARKET'.");
    }
    res.status(200).send('SMS Received');
});

// 2. Static File Serving (Lower Priority)
app.use(express.static(path.join(__dirname, 'build')));

let openai;
try {
    if (process.env.OPENAI_API_KEY) {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
} catch (e) {
    console.error('Failed to initialize OpenAI:', e.message);
}

// Additional Global Routes for Diagnostics
app.get('/health', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send('CON Health Check OK');
});

app.get('/status', (req, res) => {
    res.json({
        status: 'online',
        time: new Date().toISOString(),
        node: process.version,
        env: process.env.NODE_ENV || 'production'
    });
});

app.post('/api/chat', async (req, res) => {
    try {
        const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Gemini API not configured' });
        }
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        const contents = messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI.';

        res.json({ role: 'assistant', content: text });
    } catch (error) {
        console.error('Error calling Gemini REST API:', error);
        res.status(500).json({ error: 'Failed to process chat request' });
    }
});



// Handle all other routes by serving the index.html file
app.get('*', (req, res) => {
    // If it's a browser request (has Accept: text/html), serve the app
    const accept = req.headers.accept || '';
    if (accept.includes('text/html')) {
        return res.sendFile(path.join(__dirname, 'build', 'index.html'), (err) => {
            if (err) {
                res.status(404).send('mAgri SPA not found. Please run build.');
            }
        });
    }

    // Otherwise, return debug info as JSON (very helpful for USSD providers)
    res.json({
        msg: "mAgri Node Fallback",
        url: req.url,
        path: req.path,
        query: req.query,
        method: req.method,
        headers: req.headers
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
