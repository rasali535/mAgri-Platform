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
app.use(express.urlencoded({ extended: false }));

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

// USSD & SMS Bridge Configuration (Africa's Talking Standard)
// Handling both POST and GET to be more robust against provider configurations
app.all('/api/ussd', (req, res) => {
    // Africa's Talking sends parameters in body (POST) or query (GET)
    const { sessionId, serviceCode, phoneNumber, text = '' } = { ...req.query, ...req.body };

    console.log(`USSD Request: ${req.method} ${req.url} - Session: ${sessionId}, Text: "${text}"`);

    let response = '';

    // If text is undefined or null, default to empty string
    const currentText = text || '';

    if (currentText === '') {
        // Main USSD menu
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
        sendSMS(phoneNumber, "mAgri Alert: Your application for KES 5,000 micro-credit has been received and is being processed.");
    } else if (currentText === '3') {
        response = `END Weather forecast for your region: Sunny with light showers in the evening. Ideal for planting.`;
        sendSMS(phoneNumber, "mAgri Weather: Sunny with light showers in the evening in your region. Good for planting!");
    } else if (currentText === '4') {
        response = `CON Please type your question for the agronomist:`;
    } else if (currentText.startsWith('4*')) {
        response = `END Your message has been sent to our expert agronomists. You will receive a response via SMS shortly.`;
        sendSMS(phoneNumber, "mAgri: Your question has been routed to an expert. Expect a reply within 2 hours.");
    } else if (currentText === '5') {
        response = `END You have 1 new message from a Buyer: "Interested in 500kg of Grade A Maize. Quote price?"`;
        sendSMS(phoneNumber, "mAgri Buyer Alert: You have a new message from a Grade A Maize buyer. Dial *384*14032*5# to respond.");
    } else {
        response = `END Invalid option. Please try again.`;
    }

    res.set('Content-Type', 'text/plain');
    res.send(response);
});

app.post('/api/sms', (req, res) => {
    const { from, to, text, date, id } = req.body;
    console.log(`Received SMS from ${from}: ${text}`);

    // Auto-reply to standard SMS
    if (text.toLowerCase().includes('help')) {
        sendSMS(from, "Welcome to mAgri Help. Reply with 'CREDIT', 'WEATHER', or 'MARKET' for specific info.");
    }

    res.status(200).send('SMS Received');
});

// Handle all other routes by serving the index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
