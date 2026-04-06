import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { sendSMS as atSendSMS, sendWhatsApp } from './whatsapp/africa.js';
import { processMessage as processWhatsApp, processImage } from './whatsapp/bot.js';
import {
    notifyOrderConfirmation,
    notifyCreditApplication,
    notifyCreditApproved,
    notifyWhatsApp,
} from './whatsapp/notify.js';
import { initBaileys, getQRAsHTML } from './whatsapp/baileys.js';
import { getSession, updateSession } from './whatsapp/supabaseStore.js';
import { getLang } from './whatsapp/translations.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies and URL-encoded data from USSD/SMS providers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('mARI Platform Node Server - Operational');
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
// Helper function to send SMS via Africa's Talking (delegates to whatsapp/africa.js)
async function sendSMS(to, message) {
    try {
        await atSendSMS(to, message);
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
}

// ── Baileys Admin QR Route ──
app.get('/admin/qr', async (req, res) => {
    try {
        const html = await getQRAsHTML();
        res.status(200).send(html);
    } catch (e) {
        res.status(500).send('Error generating QR');
    }
});

// ── WhatsApp Inbound Webhook (Legacy Africa's Talking) ───────────────────────
// Africa's Talking will POST here when a WhatsApp message is received.
// Set this URL in your AT dashboard under Messaging → Channels → WhatsApp → Callback URL.
app.post(['/api/whatsapp/webhook', '/api/whatsapp/webhook/'], async (req, res) => {
    try {
        // AT sends fields via URL-encoded body
        const from = req.body.from || req.body.From || '';
        const text = req.body.text || req.body.Text || req.body.message || req.body.Message || '';

        console.log(`[WhatsApp Inbound] from=${from} text=${text}`);

        if (!from) {
            return res.status(400).send('Missing from field');
        }

        // Strip the "whatsapp:" prefix if present → clean E.164 number
        const phone = from.replace(/^whatsapp:/i, '');

        // Process through the FSM bot
        const reply = await processWhatsApp(phone, text);

        // Send the reply back via WhatsApp
        await sendWhatsApp(phone, reply);

        res.status(200).send('OK');
    } catch (err) {
        console.error('[WhatsApp Webhook Error]', err);
        res.status(500).send('Internal server error');
    }
});

// ── Manual WhatsApp send / typed notifications ────────────────────────────────
// Supports both a raw `message` body and structured `type` actions.
// Body shapes:
//   { to, message, channel? }                          → raw text
//   { to, type: "order",          payload: {...} }     → order confirmation
//   { to, type: "credit-apply",   payload: {...} }     → credit application received
//   { to, type: "credit-approved",payload: {...} }     → credit approved
app.post(['/api/whatsapp/send', '/api/whatsapp/send/'], async (req, res) => {
    try {
        const { to, message, channel, type, payload } = req.body;

        if (!to) {
            return res.status(400).json({ error: '"to" is required' });
        }

        let result;

        if (type === 'order') {
            result = await notifyOrderConfirmation(to, payload || {});
        } else if (type === 'credit-apply') {
            result = await notifyCreditApplication(to, payload || {});
        } else if (type === 'credit-approved') {
            result = await notifyCreditApproved(to, payload || {});
        } else if (message) {
            if (channel === 'sms') {
                result = await atSendSMS(to, message);
            } else {
                result = await notifyWhatsApp(to, message);
            }
        } else {
            return res.status(400).json({ error: 'Provide either "message" or a valid "type"' });
        }

        res.json({ success: true, result });
    } catch (err) {
        console.error('[WhatsApp Send Error]', err);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// ── Web Application Diagnosis API ───────────────────────────────────────────
app.post(['/api/diagnose', '/api/diagnose/'], async (req, res) => {
    try {
        const { imageBase64, mimeType } = req.body;
        if (!imageBase64) return res.status(400).json({ error: 'Image data missing' });

        const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) return res.status(500).json({ error: 'Diagnosis service unconfigured' });

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: 'Analyze this crop image for diseases. Respond in valid JSON only: {"disease": "...", "confidence": 0-100, "recommendation": "..."}' },
                        { inline_data: { mime_type: mimeType || 'image/jpeg', data: imageBase64 } }
                    ]
                }]
            })
        });

        if (!response.ok) throw new Error(`AI error: ${response.status}`);
        const data = await response.json();
        
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        text = text.replace(/```json|```/g, '').trim();
        res.json(JSON.parse(text));
    } catch (err) {
        console.error('[Diagnose API Error]', err.message);
        res.status(500).json({ error: 'Analysis failed' });
    }
});


// ── USSD & SMS Bridge ─────────────────────────────────────────────────────────
// Internal helper: AI agronomist answer via Gemini (used in USSD option 4)
async function askGeminiUSSD(question) {
    try {
        const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) return 'AI service unavailable. Our team will reply shortly.';

        const resp = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are mARI, the expert AI Agronomist by mARI Platform, developed by Pameltex Tech, for African smallholder farmers. Answer in 2-3 short SMS-friendly sentences (max 160 chars). Farmer's question: ${question}`
                        }]
                    }]
                })
            }
        );
        if (!resp.ok) return 'AI service busy. Our team will reply via SMS soon.';
        const data = await resp.json();
        return (data.candidates?.[0]?.content?.parts?.[0]?.text || 'No answer received.').slice(0, 320);
    } catch (e) {
        console.error('[USSD AI Error]', e.message);
        return 'AI service error. A human agronomist will respond via SMS.';
    }
}

// Marketplace listings (shared with WhatsApp bot)
const LISTINGS = [
    { type: 'buy', produce: 'Maize', qty: '5 Tons', price: 'Negotiable', location: 'Lusaka, ZM', user: 'AgriCorp' },
    { type: 'sell', produce: 'Cocoa Beans', qty: '200 kg', price: '60 ZMW/kg', location: 'Abidjan, CI', user: 'Kouame' },
    { type: 'buy', produce: 'Cashew Nuts', qty: '1 Ton', price: 'Negotiable', location: 'Bouaké, CI', user: 'Export Co.' },
    { type: 'sell', produce: 'Tomatoes', qty: '50 kg', price: '300 ZMW', location: 'Ndola, ZM', user: 'Grace' },
    { type: 'sell', produce: 'Onions', qty: '500 kg', price: '120 ZMW', location: 'Livingstone', user: 'Banda' },
    { type: 'buy', produce: 'Soybeans', qty: '10 Tons', price: 'Negotiable', location: 'Kitwe, ZM', user: 'Global Feed' },
];

// USSD handler (supports both /ussd and /api/ussd)
async function handleUSSD(req, res) {
    res.set('Content-Type', 'text/plain');
    try {
        const { phoneNumber, text = '' } = { ...req.query, ...req.body };
        const session = await getSession(phoneNumber);
        const parts = (text || '').toString().trim().split('*');
        const depth = parts.length;
        const L1 = parts[0];
        const L2 = parts[1];
        const L3 = parts.slice(2).join('*');

        // Detect if we need to show language selection
        const isInitialDial = text === '';
        if (isInitialDial && (!session.language || session.language === 'en' && !session.linked)) {
            return res.send(getLang('en').ussd_lang);
        }

        // Handle language selection input
        const possibleLangs = ['1', '2', '3', '4', '5'];
        if (depth === 1 && possibleLangs.includes(L1) && (!session.language || session.language === 'en' && !session.linked)) {
            let lang = 'en';
            if (L1 === '1') lang = 'en';
            else if (L1 === '2') lang = 'tn';
            else if (L1 === '3') lang = 'fr';
            else if (L1 === '4') lang = 'ny';
            else if (L1 === '5') lang = 'be';

            await updateSession(phoneNumber, { language: lang });
            return res.send(getLang(lang).ussd_menu);
        }

        const L = getLang(session.language || 'en');
        console.log(`[USSD] ${phoneNumber} text="${text}" depth=${depth} lang=${session.language}`);

        let response = '';

        // ── Main Menu ─────────────────────────────────────────────────────────────
        if (text === '' || L1 === '0' || L1 === 'MENU') {
            response = L.ussd_menu;

            // ── Option 1: Dashboard & Orders ──────────────────────────────────────────
        } else if (L1 === '1') {
            if (depth === 1) {
                response = `CON Home Dashboard\n\n` +
                           `Local Weather: 28C Sunny\n` +
                           `Location: Gaborone, BW\n\n` +
                           `1. Check Weather Forecast\n` +
                           `2. Recent Activity\n` +
                           `3. Quick Crop Scan\n` +
                           `0. Back`;
            } else if (L2 === '1') {
                response = `END Weather Forecast:\nToday: Sunny 28C\nTomorrow: Showers 24C\nDay 3: Cloudy 26C`;
                atSendSMS(phoneNumber, "mARI Weather: Today Sunny 28C | Tomorrow Showers 24C | Day 3 Cloudy 26C.");
            } else if (L2 === '2') {
                response = `END Recent Activity:\n- Crop Scan: Maize (Healthy)\n- Market: Browsed Rice prices\n- Credit: App Approved`;
            } else if (L2 === '3') {
                response = `END Please check your WhatsApp to complete the quick crop scan.`;
                sendWhatsApp(phoneNumber, "📸 Ready to scan your crop? Please send me a photo of the affected area.");
            }

        } else if (L1 === '2') {
            if (depth === 1) {
                response =
                    `CON AgriMarket - Latest Listings:\n` +
                    `1. Sellers (available produce)\n` +
                    `2. Buyers (wanted produce)\n` +
                    `3. All listings (SMS)`;
            } else if (L2 === '1') {
                const sellers = LISTINGS.filter(l => l.type === 'sell').slice(0, 3);
                const lines = sellers.map((l, i) => `${i + 1}. ${l.produce} ${l.qty} @ ${l.price} - ${l.location}`);
                response = `END Sellers:\n${lines.join('\n')}`;
                atSendSMS(phoneNumber, `mARI Market Sellers:\n${lines.join('\n')}\nContact: ${process.env.WEBAPP_URL}`);
            } else if (L2 === '2') {
                const buyers = LISTINGS.filter(l => l.type === 'buy').slice(0, 3);
                const lines = buyers.map((l, i) => `${i + 1}. ${l.produce} ${l.qty} ${l.price} - ${l.location}`);
                response = `END Buyers Wanted:\n${lines.join('\n')}`;
                atSendSMS(phoneNumber, `mARI Market Buyers:\n${lines.join('\n')}\nContact: ${process.env.WEBAPP_URL}`);
            } else if (L2 === '3') {
                const all = LISTINGS.slice(0, 4).map(l => `${l.type.toUpperCase()} ${l.produce} ${l.qty} ${l.location}`);
                response = `END Full list sent via SMS!`;
                atSendSMS(phoneNumber, `mARI Market All Listings:\n${all.join('\n')}\nMore: ${process.env.WEBAPP_URL}`);
            }

        } else if (L1 === '3') {
            if (depth === 1) {
                response =
                    `CON Crop Scan (mARI AI)\n` +
                    `1. Get Scan Link (SMS)\n` +
                    `2. Continue on WhatsApp`;
            } else if (L2 === '1') {
                response = `END A link to our crop scanner has been sent to you via SMS.`;
                atSendSMS(phoneNumber, `mARI Crop Scan: ${process.env.WEBAPP_URL}/diagnose`);
            } else if (L2 === '2') {
                response = `END Please check your WhatsApp to complete the crop scan.`;
                sendWhatsApp(phoneNumber, "📸 Ready to scan your crop? Please send me a photo of the affected area.");
            }

        } else if (L1 === '4') {
            if (depth === 1) {
                response = `CON ${L.agronomist_prompt}`;
            } else if (depth >= 2) {
                const lastPart = parts[depth - 1];
                if (lastPart === '0' || lastPart.toUpperCase() === 'MENU') {
                    response = L.ussd_menu;
                } else {
                    const answer = await askGeminiUSSD(lastPart);
                    response = `CON mARI: ${answer}\n\nAsk follow-up (or 0 to exit):`;
                }
            }

        } else if (L1 === '5') {
            if (depth === 1) {
                response = `CON Finance & Credit\n1. Check Credit Score\n2. Apply for Micro-Credit`;
            } else if (L2 === '1') {
                response = `END Your mARI Platform Credit Score is 745/850 (Excellent).\nKeep up responsible trading!`;
                atSendSMS(phoneNumber, 'mARI Platform: Your Credit Score is 745/850 (Excellent). Keep trading!');
            } else if (L2 === '2') {
                if (depth === 2) {
                    response = `CON Micro-Credit Application\nEnter amount (e.g. 5000):`;
                } else if (depth === 3) {
                    const amount = L3 || '0';
                    const num = parseFloat(amount);
                    if (isNaN(num) || num <= 0) {
                        response = `END Invalid amount. Please try again. Dial *384*14032*5*2#`;
                    } else {
                        response = `CON Apply for ${amount} micro-credit?\n1. Confirm\n2. Cancel`;
                    }
                } else if (depth === 4) {
                    if (parts[3] === '1') {
                        const amount = L3;
                        response = `END Application for ${amount} received!\nYou'll get SMS confirmation shortly.`;
                        atSendSMS(phoneNumber, `mARI Platform: Your micro-credit application for ${amount} has been received. We'll review and confirm within 24hrs.`);
                    } else {
                        response = `END Application cancelled.`;
                    }
                }
            }

        } else if (L1 === '6') {
            if (depth === 1) {
                response = `CON My Account\n1. Profile Details\n2. Shared Wallet\n3. Notification Settings\n0. Back`;
            } else if (L2 === '1') {
                response = `END Profile Details:\nName: Farmer\nPhone: ${phoneNumber}\nRole: Seller\nLocation: Gaborone`;
            } else {
                response = `END This feature is under maintenance. Please use the mARI App.`;
            }

        } else if (L1 === '7') {
            if (depth === 1) {
                response = L.ussd_lang;
            } else if (depth === 2) {
                let nLang = 'en';
                if (L2 === '1') nLang = 'en';
                else if (L2 === '2') nLang = 'tn';
                else if (L2 === '3') nLang = 'fr';
                else if (L2 === '4') nLang = 'ny';
                else if (L2 === '5') nLang = 'be';
                await updateSession(phoneNumber, { language: nLang });
                response = getLang(nLang).ussd_menu;
            }

        } else {
            response = `END Invalid option. Dial *384*14032# to start again.`;
        }

        res.send(response);
    } catch (err) {
        console.error('[USSD Global Error]', err.message);
        res.send(`END System error. Please try again later.`);
    }
}

// Register USSD on both paths (AT sends to /ussd, middleware may redirect to /api/ussd)
app.all(['/ussd', '/ussd/'], handleUSSD);
app.all(['/api/ussd', '/api/ussd/'], handleUSSD);
app.post('/', handleUSSD);

// Inbound SMS handler
app.post(['/api/sms', '/api/sms/'], async (req, res) => {
    const { from, text } = { ...req.query, ...req.body };
    const msg = (text || '').trim().toUpperCase();
    console.log(`[SMS] from=${from} text="${text}"`);

    if (msg === 'HELP' || msg === 'HI' || msg === 'HELLO') {
        atSendSMS(from, "Welcome to mARI Platform! Reply: CREDIT, WEATHER, MARKET or dial *384*14032# for the full menu.");
    } else if (msg === 'CREDIT') {
        atSendSMS(from, "mARI Platform Credit Score: 745/850 (Excellent). Dial *384*14032*5*2# to apply for micro-credit.");
    } else if (msg === 'WEATHER') {
        atSendSMS(from, "mARI Platform Weather: Today Sunny 28C | Tomorrow Light showers 24C | Day 3 Cloudy 26C.");
    } else if (msg === 'MARKET') {
        const lines = LISTINGS.slice(0, 3).map(l => `${l.type.toUpperCase()} ${l.produce} - ${l.location}`);
        atSendSMS(from, `mARI Platform Market:\n${lines.join('\n')}\nMore: ${process.env.WEBAPP_URL}`);
    } else if (msg.startsWith('ASK ')) {
        const question = text.slice(4).trim();
        askGeminiUSSD(question).then(answer => {
            atSendSMS(from, `mARI AI:\n${answer}`);
        });
        atSendSMS(from, 'mARI AI: Processing your question... reply in a moment!');
    }

    res.status(200).send('OK');
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

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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

app.post('/api/diagnose', async (req, res) => {
    try {
        const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Gemini API not configured' });
        }
        const { imageBase64, mimeType } = req.body;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: 'You are mARI, an expert agronomist AI. Analyze the crop image for diseases. Respond in valid JSON exactly: {"disease": "...", "confidence": 0-100, "recommendation": "..."}' },
                        { inline_data: { mime_type: mimeType, data: imageBase64 } }
                    ]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        // Strip markdown backticks if AI included them
        text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').replace(/^```\n?/, '').trim();
        
        try {
            const parsed = JSON.parse(text);
            res.json(parsed);
        } catch (e) {
            console.error('Invalid AI JSON:', text);
            res.status(500).json({ error: 'AI returned invalid JSON format' });
        }
    } catch (error) {
        console.error('Error calling Gemini REST API for diagnosis:', error);
        res.status(500).json({ error: 'Failed to process diagnosis' });
    }
});



// Handle all other routes by serving the index.html file
app.get('*', (req, res) => {
    // If it's a browser request (has Accept: text/html), serve the app
    const accept = req.headers.accept || '';
    if (accept.includes('text/html')) {
        return res.sendFile(path.join(__dirname, 'build', 'index.html'), (err) => {
            if (err) {
                res.status(404).send('Pameltex Tech SPA not found. Please run build.');
            }
        });
    }

    // Otherwise, return debug info as JSON (very helpful for USSD providers)
    res.json({
        msg: "mARI Platform Node Fallback",
        url: req.url,
        path: req.path,
        query: req.query,
        method: req.method,
        headers: req.headers
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    // Start Baileys only after the express server has successfully bound
    initBaileys().catch(e => console.error('Failed to init Baileys:', e));
});

export default app;
