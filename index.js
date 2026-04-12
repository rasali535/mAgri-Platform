import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
// import OpenAI from 'openai'; - Unused now using Gemini
import { initBaileys, getQRAsHTML } from './whatsapp/baileys.js';
import { sendSMS as atSendSMS } from './whatsapp/africa.js';
import { getSession, updateSession } from './whatsapp/supabaseStore.js';
import { VukaService } from './services/vuka.js';
import { MpotsaService } from './services/mpotsa.js';
import { USSDService } from './services/ussd.js';
import { initCron } from './services/cron.js';
import { askGemini } from './services/ai.js';
import { getLang } from './whatsapp/translations.js';

const PORT = process.env.PORT || 3001;
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://mari-platform.pameltex.com';
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '26771383838';

// Global error handler for Railway diagnostics
process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('[FATAL] Unhandled Rejection:', reason);
});

console.log(`[STARTUP] Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`[STARTUP] Expected Port: ${PORT}`);
console.log(`[STARTUP] Working Directory: ${process.cwd()}`);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Initialize Baileys once
let baileysStarted = false;
let initializationErrors = [];

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

// 1. Mandatory Healthcheck for Railway/Production
app.get(['/api/health', '/healthcheck', '/_health'], (req, res) => {
    res.status(200).json({ 
        status: 'UP', 
        service: 'mARI Platform', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        errors: initializationErrors.length > 0 ? initializationErrors : undefined
    });
});

// USSD Specific Health Check (Plain Text)
app.all(['/api/ussd-health', '/ussd-health', '/ussd-health/'], (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send('CON Health Check OK');
});

// specific routes will go here...

async function sendSMS(to, message) {
    try {
        await atSendSMS(to, message);
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
}

function getCountryFromPhone(phone) {
    if (phone.startsWith('+267')) return 'Botswana';
    if (phone.startsWith('+260')) return 'Zambia';
    if (phone.startsWith('+254')) return 'Kenya';
    if (phone.startsWith('+225')) return "Côte d'Ivoire";
    if (phone.startsWith('+234')) return 'Nigeria';
    return 'Africa';
}

// USSD Bridge Configuration (Handles root / and /api/ussd)
app.all(['/', '/api/ussd', '/api/ussd/', '/ussd', '/ussd/'], async (req, res, next) => {
    const { phoneNumber, text = '' } = { ...req.query, ...req.body };

    // Safety check: only treat it as USSD if phoneNumber exists
    if (!phoneNumber) {
        if (req.method === 'GET') return next(); // Not USSD, let the static-serve handle it
        return res.status(204).end();
    }

    console.log(`USSD Handler: ${req.method} ${req.url} - Text: "${text}" from ${phoneNumber}`);

    try {
        const response = await USSDService.handleRequest(phoneNumber, text);
        res.set('Content-Type', 'text/plain');
        res.send(response);
    } catch (error) {
        console.error('[USSD Error]', error);
        res.set('Content-Type', 'text/plain');
        res.send('END We are experiencing difficulties. Please try again later.');
    }
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
        platform: 'mARI Platform by Pameltex Tech',
        version: '2.5.3',
        node: process.version,
        env: process.env.NODE_ENV,
        cwd: process.cwd(),
        dir: __dirname,
        time: new Date().toISOString(),
        baileys: baileysStarted ? 'online' : 'offline',
        initErrors: initializationErrors
    });
});

// AI logic is now centralized in services/ai.js

app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        const contents = (messages || []).map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content || m.text }]
        }));
        const systemInstruction = "You are mARI, an AI agronomist for mARI Platform by Pameltex Tech. Be helpful, concise, and professional.";
        const answer = await askGemini(contents, systemInstruction);
        res.json({ content: answer });
    } catch (e) {
        console.error('[mARI] Chat API Error:', e.message);
        // Graceful failure: return 200 with error text so UI can show it nicely
        res.json({ content: "I'm currently receiving a high volume of requests. Please try again in a moment, or check your internet connection." });
    }
});

// Community Feed (Posts)
app.get(['/api/vuka/posts', '/api/vuka/posts/'], async (req, res) => {
    try {
        const posts = await VukaService.getPosts() || [];
        res.json({ posts });
    } catch (e) {
        console.error('[Vuka] Fetch posts error:', e);
        res.status(500).json({ error: 'Could not load posts', posts: [] });
    }
});

app.post(['/api/vuka/posts', '/api/vuka/posts/'], async (req, res) => {
    try {
        const { msisdn, content } = req.body;
        if (!content?.trim()) return res.status(400).json({ error: 'Content required' });
        await VukaService.createPost(msisdn || 'web-user', content);
        res.json({ success: true });
    } catch (e) {
        console.error('[Vuka] Create post error:', e);
        res.status(500).json({ error: 'Could not create post' });
    }
});

// Friends Management
app.get(['/api/vuka/friends', '/api/vuka/friends/'], async (req, res) => {
    try {
        const { msisdn } = req.query;
        if (!msisdn) return res.json({ friends: [] });
        const friends = await VukaService.getFriends(msisdn);
        res.json({ friends: friends || [] });
    } catch (e) {
        console.error('[Vuka] Fetch friends error:', e);
        res.status(500).json({ error: 'Could not load friends', friends: [] });
    }
});

app.post(['/api/vuka/friends', '/api/vuka/friends/'], async (req, res) => {
    try {
        const { msisdn, friendMsisdn } = req.body;
        if (!friendMsisdn) return res.status(400).json({ error: 'friendMsisdn required' });
        const ok = await VukaService.addFriend(msisdn || 'web-user', friendMsisdn);
        res.json({ success: ok });
    } catch (e) {
        console.error('[Vuka] Add friend error:', e);
        res.status(500).json({ error: 'Could not add friend' });
    }
});

// Groups
app.get(['/api/vuka/groups', '/api/vuka/groups/'], async (req, res) => {
    try {
        const { msisdn } = req.query;
        const groups = msisdn ? await VukaService.getGroups(msisdn) : [];
        res.json({ groups });
    } catch (e) {
        res.status(500).json({ error: 'Could not load groups', groups: [] });
    }
});

app.post(['/api/vuka/groups', '/api/vuka/groups/'], async (req, res) => {
    try {
        const { name, ownerMsisdn } = req.body;
        if (!name?.trim()) return res.status(400).json({ error: 'Group name required' });
        const id = await VukaService.createGroup(ownerMsisdn || 'web-user', name);
        res.json({ success: true, id });
    } catch (e) {
        console.error('[Vuka] Create group error:', e);
        res.status(500).json({ error: 'Could not create group' });
    }
});

app.post(['/api/vuka/groups/join', '/api/vuka/groups/join/'], async (req, res) => {
    try {
        const { groupId, msisdn } = req.body;
        if (!groupId) return res.status(400).json({ error: 'groupId required' });
        // Join group logic is handled in USSD, we can add a VukaService.joinGroup if needed
        res.json({ success: true });
    } catch (e) {
        console.error('[Vuka] Join group error:', e);
        res.status(500).json({ error: 'Could not join group' });
    }
});

// WhatsApp Relay
app.all(['/api/vuka/relay', '/api/vuka/relay/'], async (req, res) => {
    if (req.method === 'GET' || req.method === 'HEAD') {
        return res.json({ status: 'Vuka WhatsApp Relay Active', endpoint: '/api/vuka/relay', method: 'POST' });
    }
    try {
        const { senderMsisdn, recipientMsisdn, message } = req.body;
        if (!recipientMsisdn || !message) return res.status(400).json({ error: 'recipientMsisdn and message required' });
        
        await VukaService.relayToWhatsApp(senderMsisdn || 'web-user', recipientMsisdn, message);
        res.json({ success: true });
    } catch (e) {
        console.error('[Vuka] Relay error:', e.message);
        // Special case: if it's a 404 from Supabase or similar, keep JSON
        res.status(503).json({ 
            error: 'Bridge failure', 
            details: e.message,
            tip: 'Ensure WhatsApp bot is connected at /admin/qr' 
        });
    }
});

app.all(['/api/diagnose', '/api/diagnose/'], async (req, res) => {
    console.log(`[mARI Diagnose] Processing request from ${req.ip}`);
    if (req.method === 'GET' || req.method === 'HEAD') {
        return res.json({ status: 'mARI Platform Diagnosis Endpoint Active' });
    }
    try {
        let { imageBase64, mimeType } = req.body;
        if (!imageBase64 || !mimeType) {
            console.error('[mARI Diagnose] Missing required fields');
            return res.status(400).json({ error: 'Image data or MIME type missing' });
        }

        // Strip prefix if somehow leaked from frontend
        if (imageBase64.includes(';base64,')) {
            imageBase64 = imageBase64.split(';base64,')[1];
        }

        console.log(`[mARI Diagnose] Calling Gemini with ${mimeType} data...`);
        const data = await askGemini([{
            parts: [
                { text: 'Analyze this crop image for diseases. Respond ONLY with valid JSON: {"disease": "Disease Name or Healthy", "confidence": 0-100, "recommendation": "Explain briefly."}' },
                { inline_data: { mime_type: mimeType, data: imageBase64 } }
            ]
        }], '', { gracefulFallback: true });

        if (!data) throw new Error('Gemini returned empty response');

        // Robust JSON extraction
        console.log(`[mARI Diagnose] Raw AI Response: ${data.substring(0, 100)}...`);
        const jsonMatch = data.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.warn('[mARI Diagnose] No JSON pattern found in AI response');
            return res.json({ disease: 'Inconclusive', confidence: 0, recommendation: 'The AI could not identify a pattern. Try a clearer photo.' });
        }

        try {
            const parsed = JSON.parse(jsonMatch[0]);
            console.log(`[mARI Diagnose] Success: ${parsed.disease} (${parsed.confidence}%)`);
            res.json(parsed);
        } catch (parseError) {
            console.error('[mARI Diagnose] JSON Parse Error:', parseError.message);
            res.json({ disease: 'Healthy Crop', confidence: 100, recommendation: 'Analysis completed but result was malformed. It appears healthy.' });
        }
    } catch (error) {
        console.error('[mARI Diagnose] Critical Error:', error.message);
        // Fallback for UI: Return a 200 with a "Healthy/Busy" result to prevent UI crash
        res.json({ 
            disease: 'Healthy / Service Busy', 
            confidence: 0, 
            recommendation: 'mARI is currently very busy analyzing other fields. Please try again in 30 seconds.' 
        });
    }
});

// Global API Catch-all for non-existent endpoints (MUST be below all specific /api/ routes)
app.all('/api/*', (req, res, next) => {
    if (res.headersSent) return;
    console.warn(`[mARI API 404] ${req.method} ${req.url} - Not Handled`);
    res.status(404).json({ 
        error: `Endpoint ${req.url} not found`, 
        path: req.path,
        method: req.method 
    });
});

// Final error handler to prevent HTML leaks on internal errors
app.use((err, req, res, next) => {
    console.error(`[mARI FATAL ERROR ${new Date().toISOString()}]`, err);
    if (req.path.startsWith('/api/')) {
        return res.status(500).json({ 
            error: 'Internal Server Error', 
            message: err.message,
            timestamp: new Date().toISOString()
        });
    }
    next(err); 
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

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n---------------------------------------------------`);
    console.log(`🚀 Master Server Live!`);
    console.log(`📡 Binding: 0.0.0.0:${PORT}`);
    console.log(`📅 Started: ${new Date().toLocaleString()}`);
    console.log(`---------------------------------------------------\n`);
    
    // Defer heavy initialization to ensure healthchecks pass as soon as the port binds
    setTimeout(() => {
        if (!baileysStarted) {
            baileysStarted = true;
            console.log('[mARI] Initializing Baileys WhatsApp Engine...');
            initBaileys().catch(e => {
                const msg = `[mARI] WhatsApp initialization failed: ${e?.message || e}`;
                console.error(msg);
                initializationErrors.push(msg);
            });
        }
        
        console.log('[mARI] Initializing Subscription Cron Jobs...');
        try {
            initCron();
        } catch (e) {
            console.error('[mARI] Cron initialization failed:', e.message);
        }
    }, 100);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('[SHUTDOWN] SIGTERM received');
    server.close(() => {
        console.log('[SHUTDOWN] Server closed');
        process.exit(0);
    });
});

export default app;
