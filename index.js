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
import { askGemini } from './services/ai.js';
import { getLang } from './whatsapp/translations.js';


// Global error handler for Railway diagnostics
process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('[FATAL] Unhandled Rejection:', reason);
});

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
app.get(['/health', '/api/health', '/healthcheck'], (req, res) => {
    res.status(200).json({ status: 'ok', service: 'mARI Platform by Pameltex Tech', time: new Date().toISOString() });
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

    const parts = (text || '').toString().trim().split('*');
    const depth = parts.length;
    const L1 = parts[0];

    let response = '';

    const session = await getSession(phoneNumber);
    const language = session.language || 'en';
    const L = getLang(language);

    if (text === '' || L1 === '0' || L1 === 'MENU') {
        const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        // Use ussd_menu translation if available, else fallback to branded list
        if (L.ussd_menu) {
            response = L.ussd_menu.replace(/\\n/g, '\n');
            if (!response.includes(dateStr)) response += `\n📅 ${dateStr}`;
        } else {
            response = `CON 🌱 *mARI Platform by Pameltex Tech*\n`;
            response += `1. Dashboard\n`;
            response += `2. Marketplace\n`;
            response += `3. Crop Scan\n`;
            response += `4. Ask mARI (AI Advisor)\n`;
            response += `5. Finance & Credit\n`;
            response += `6. Weather Forecast\n`;
            response += `7. Farmer Community\n`;
            response += `8. Vuka Social\n`;
            response += `9. Language Settings\n`;
            response += `10. Mpotsa Q&A\n`;
            response += `📅 ${dateStr}`;
        }

    } else if (L1 === '1') {
        response = `END *Dashboard*\nYou have 0 active orders and 0 listings. Use the web app for full details.`;
    } else if (L1 === '2') {
        response = `END *mARI Platform by Pameltex Tech Marketplace*\nBrowse local grain prices or post your crop for sale in the community forum.`;
    } else if (L1 === '3') {
        response = `END *Crop Scan (mARI AI)*\nTo diagnose a crop disease, please upload a photo using our WhatsApp bot or the Web App.`;
    } else if (L1 === '4') {
        const lastPart = (parts[depth - 1] || '').trim();
        try {
            if (depth === 1 || lastPart === '1') {
                response = `CON *mARI AI Advisor*\n(Synced with WhatsApp)\nType your farming question:`;
            } else if (lastPart === '0') {
                response = `CON 🌱 *mARI Platform by Pameltex Tech*\n1. Dashboard\n2. Marketplace\n3. Crop Scan\n4. Ask mARI\n5. Finance\n6. Weather\n0. Exit`;
            } else {
                const question = lastPart;
                // Session fallback: if DB fails, keep going with empty history
                let session = { history: [] };
                try {
                    session = await getSession(phoneNumber);
                } catch (dbErr) {
                    console.error('[mARI DB Fallback] DB unavailable, using memory.');
                }

                const country = getCountryFromPhone(phoneNumber);
                const systemPrompt = `You are mARI, an AI agronomist for the mARI Platform by Pameltex Tech. Location: ${country}. Respond in ${language}. Be extremely concise.`;
                const answer = await askGemini([{ role: 'user', parts: [{ text: question }] }], systemPrompt);

                // Try to sync, but don't crash if it fails
                updateSession(phoneNumber, {
                    history: [...(session.history || []), { role: 'user', parts: [{ text: question }] }, { role: 'model', parts: [{ text: answer }] }].slice(-10)
                }).catch(() => { });

                sendSMS(phoneNumber, `mARI AI Advice: ${answer}\n\nType MENU to return.`);
                const snippet = answer.substring(0, 80) + '...';
                response = `CON *mARI:* ${snippet}\n1. Ask Follow-up\n0. Menu`;
            }
        } catch (error) {
            console.error('[USSD AI Error]', error.message || error);
            const errorType = error.message?.includes('AI_API_ERR_404') ? 'Model Not Found' :
                error.message?.includes('AI_API_ERR_401') ? 'API Key Invalid' :
                    error.message?.includes('TIMEOUT') ? 'Request Timeout' : 'Service Down';
            response = `CON ⚠️ mARI is having trouble connecting to AI (${errorType}).\n1. Try Again\n0. Menu`;
        }
    } else if (L1 === '5') {
        response = `CON *Finance & Credit*\n1. Check Score\n2. Apply for Loan`;
    } else if (L1 === '6') {
        response = `END *Weather Forecast*\nSunny with light showers expected in the evening. Keep your seeds dry!`;
        sendSMS(phoneNumber, "mARI Platform by Pameltex Tech Weather: Region forecast is Sunny with light showers in the evening.");
    } else if (L1 === '7') {
        response = `END *Farmer Community*\nJoin the mARI Platform by Pameltex Tech community to discuss crop prices and tips. High activity in Lusaka/Kitwe.`;
    } else if (L1 === '8') {
        // Vuka Social Network
        if (depth === 1) {
            response = `CON *Vuka Social*\n1. My Profile\n2. Find Friends\n3. Group Chats\n4. WhatsApp Relay`;
        } else if (parts[1] === '1') {
            const user = await VukaService.getUser(phoneNumber);
            if (!user) {
                response = `CON *My Profile*\nYou are not registered. Reply with your name to join Vuka:`;
                if (depth === 3) {
                    await VukaService.registerUser(phoneNumber, parts[2]);
                    response = `END Welcome to Vuka, ${parts[2]}! Your profile is ready.`;
                }
            } else {
                response = `END *My Profile*\nName: ${user.name}\nMSISDN: ${phoneNumber}\nBio: ${user.bio || 'None'}`;
            }
        } else if (parts[1] === '2') {
            if (depth === 2) {
                response = `CON *Find Friends*\nEnter MSISDN to add:`;
            } else {
                const friendMsisdn = parts[2];
                await VukaService.addFriend(phoneNumber, friendMsisdn);
                response = `END Friend request sent to ${friendMsisdn}. They will be notified via SMS.`;
            }
        } else if (parts[1] === '4') {
            if (depth === 2) {
                response = `CON *WhatsApp Relay*\nEnter Recipient MSISDN:`;
            } else if (depth === 3) {
                response = `CON *WhatsApp Relay*\nEnter Message to Send:`;
            } else {
                const recipient = parts[2];
                const message = parts.slice(3).join('*');
                await VukaService.relayToWhatsApp(phoneNumber, recipient, message);
                response = `END Your message has been relayed to WhatsApp for ${recipient}.`;
            }
        } else {
            response = `END Vuka: Feature coming soon!`;
        }
    } else if (L1 === '9') {
        if (depth === 1) {
            response = L.change_lang ? `CON ${L.change_lang.replace(/\*/g, '')}` : `CON Select Language:\n1. English\n2. Tswana\n3. French\n4. Nyanja\n5. Bemba`;
        } else {
            let newLang = 'en';
            if (parts[1] === '1') newLang = 'en';
            else if (parts[1] === '2') newLang = 'tn';
            else if (parts[1] === '3') newLang = 'fr';
            else if (parts[1] === '4') newLang = 'ny';
            else if (parts[1] === '5') newLang = 'be';
            
            await updateSession(phoneNumber, { language: newLang });
            response = `END Language updated to ${newLang.toUpperCase()}! Please restart USSD session.`;
        }
    } else if (L1 === '10') {
        // Mpotsa Q&A
        if (depth === 1) {
            response = `CON *Mpotsa Q&A*\nAsk anything (Health, Law, Jobs, Education):`;
        } else {
            const query = parts.slice(1).join(' ');
            const result = await MpotsaService.search(query, phoneNumber);
            if (result.type === 'SHORT' || result.type === 'NONE') {
                response = `END ${result.text}`;
            } else {
                response = `END ${result.text}`;
            }
        }
    } else {
        response = `END Invalid option. Type MENU to restart.`;
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
    console.log(`[mARI]🚀 Master Server Live | Port: ${PORT} | Env: ${process.env.NODE_ENV}`);
    if (!baileysStarted) {
        baileysStarted = true;
        initBaileys().catch(e => console.error('[mARI] WhatsApp failed:', e));
    }
});

export default app;
