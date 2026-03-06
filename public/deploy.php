<?php
header('Content-Type: text/plain');

$nodejs_dir = '/home/u723774100/domains/navajowhite-monkey-252201.hostingersite.com/nodejs';
$target = $nodejs_dir . '/server.js';

$server_code = <<<'SERVERJS'
import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies and URL-encoded data from USSD/SMS providers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Log all requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Root health check
app.get('/', (req, res) => {
    const accept = req.headers.accept || '';
    if (accept.includes('text/html')) {
        return res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
            if (err) res.send('mAgri Platform Node Server - Operational');
        });
    }
    res.send('mAgri Platform Node Server - Operational');
});

// USSD Health Check (Plain Text)
app.all(['/ussd-health', '/ussd-health/', '/api/ussd-health'], (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send('CON Health Check OK');
});

// Status endpoint
app.get('/status', (req, res) => {
    res.json({
        status: 'online',
        time: new Date().toISOString(),
        node: process.version,
        env: process.env.NODE_ENV || 'production'
    });
});

app.get('/health', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send('CON Health Check OK');
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

// USSD & SMS Bridge Configuration
app.all(['/ussd', '/ussd/', '/api/ussd', '/api/ussd/'], (req, res) => {
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

// API health
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Static File Serving
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all other routes by serving the index.html file
app.get('*', (req, res) => {
    const accept = req.headers.accept || '';
    if (accept.includes('text/html')) {
        return res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
            if (err) {
                res.status(404).send('mAgri SPA not found.');
            }
        });
    }
    res.json({
        msg: "mAgri Node Fallback",
        url: req.url,
        path: req.path,
        query: req.query
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`mAgri Server running on port ${PORT}`);
});

export default app;
SERVERJS;

// Write the server code
$result = file_put_contents($target, $server_code);

if ($result !== false) {
    echo "SUCCESS: Wrote $result bytes to $target\n";
    echo "New file size: " . filesize($target) . " bytes\n";

    // Also create a restart marker
    $tmp = $nodejs_dir . '/tmp';
    if (!is_dir($tmp)) {
        mkdir($tmp, 0755, true);
    }
    touch($tmp . '/restart.txt');
    echo "Created restart marker at $tmp/restart.txt\n";
} else {
    echo "FAILED to write server.js\n";
}
?>