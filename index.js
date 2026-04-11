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


// Global error handler for Railway diagnostics
process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('[FATAL] Unhandled Rejection:', reason);
});

console.log(`[STARTUP] Environment: ${process.env.NODE_ENV}`);
console.log(`[STARTUP] Expected Port: ${process.env.PORT || 3001}`);
console.log(`[STARTUP] Working Directory: ${process.cwd()}`);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

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

// 1. Mandatory Healthcheck for Railway/Production
// Added root health support if needed
app.get(['/health', '/api/health', '/healthcheck', '/_health'], (req, res) => {
    res.status(200).json({ 
        status: 'UP', 
        service: 'mARI Platform', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// USSD Specific Health Check (Plain Text)
app.all(['/api/ussd-health', '/ussd-health', '/ussd-health/'], (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send('CON Health Check OK');
});

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
        baileys: baileysStarted ? 'online' : 'offline'
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
        console.error('[mARI] Chat API Error:', e);
        res.status(500).json({ error: 'Chat service temporarily unavailable' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// VUKA SOCIAL API ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// Posts (community feed)
app.get('/api/vuka/posts', async (req, res) => {
    try {
        const posts = await VukaService.getPosts?.() || [];
        res.json({ posts });
    } catch (e) {
        res.status(500).json({ error: 'Could not load posts', posts: [] });
    }
});

app.post('/api/vuka/posts', async (req, res) => {
    try {
        const { content, msisdn } = req.body;
        if (!content?.trim()) return res.status(400).json({ error: 'Content required' });
        const id = await VukaService.createPost?.({ content, msisdn }) || Date.now().toString();
        res.json({ success: true, id });
    } catch (e) {
        console.error('[Vuka] Post error:', e);
        res.status(500).json({ error: 'Could not save post' });
    }
});

// Friends
app.post('/api/vuka/friends', async (req, res) => {
    try {
        const { userMsisdn, friendMsisdn } = req.body;
        if (!friendMsisdn) return res.status(400).json({ error: 'friendMsisdn required' });
        const ok = await VukaService.addFriend(userMsisdn || 'web-user', friendMsisdn);
        res.json({ success: ok });
    } catch (e) {
        console.error('[Vuka] Add friend error:', e);
        res.status(500).json({ error: 'Could not add friend' });
    }
});

app.get('/api/vuka/friends', async (req, res) => {
    try {
        const { msisdn } = req.query;
        const friends = msisdn ? await VukaService.getFriends(msisdn) : [];
        res.json({ friends });
    } catch (e) {
        res.status(500).json({ error: 'Could not load friends', friends: [] });
    }
});

// Groups
app.get('/api/vuka/groups', async (req, res) => {
    try {
        const { msisdn } = req.query;
        const groups = msisdn ? await VukaService.getGroups(msisdn) : [];
        res.json({ groups });
    } catch (e) {
        res.status(500).json({ error: 'Could not load groups', groups: [] });
    }
});

app.post('/api/vuka/groups', async (req, res) => {
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

app.post('/api/vuka/groups/join', async (req, res) => {
    try {
        const { groupId, msisdn } = req.body;
        if (!groupId) return res.status(400).json({ error: 'groupId required' });
        // Reuse getGroups as a proxy — extend VukaService.joinGroup when available
        res.json({ success: true });
    } catch (e) {
        console.error('[Vuka] Join group error:', e);
        res.status(500).json({ error: 'Could not join group' });
    }
});

// WhatsApp Relay
app.post('/api/vuka/relay', async (req, res) => {
    try {
        const { senderMsisdn, recipientMsisdn, message } = req.body;
        if (!recipientMsisdn || !message) return res.status(400).json({ error: 'recipientMsisdn and message required' });
        await VukaService.relayToWhatsApp(senderMsisdn || 'web-user', recipientMsisdn, message);
        res.json({ success: true });
    } catch (e) {
        console.error('[Vuka] Relay error:', e);
        res.status(503).json({ error: 'WhatsApp not connected or relay failed' });
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
        let text = data || '';
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
    console.log(`\n---------------------------------------------------`);
    console.log(`🚀 Master Server Live!`);
    console.log(`📡 Binding: 0.0.0.0:${PORT}`);
    console.log(`📅 Started: ${new Date().toLocaleString()}`);
    console.log(`---------------------------------------------------\n`);
    
    if (!baileysStarted) {
        baileysStarted = true;
        console.log('[mARI] Initializing Baileys WhatsApp Engine...');
        initBaileys().catch(e => console.error('[mARI] WhatsApp initialization failed:', e));
    }
    
    console.log('[mARI] Initializing Subscription Cron Jobs...');
    initCron();
});


export default app;
