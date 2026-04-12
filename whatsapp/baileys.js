import { makeWASocket, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';
import { useSupabaseAuthState } from './supabaseAuthState.js';
import { processMessage, processImage } from './bot.js';
import db from '../services/database.js';
import { sendSMS } from './africa.js';
import { getSupabaseClient } from '../src/lib/supabaseClient.js';
import qrcode from 'qrcode';

// Keep the socket around so we can broadcast locally or export it
export let sock = null;
let currentQR = '';

export async function initBaileys() {
    // 1. Fetch our custom auth state and baileys version
    const { state, saveCreds } = await useSupabaseAuthState('primary');
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`);
    
    // 2. Initialize Baileys
    sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ['mARI Platform by Pameltex Tech', 'Chrome', '1.0.0'],
    });
    
    // Set global reference for other modules to use (e.g., africa.js)
    global.wa_sock = sock;

    // 3. Handle Connection Updates
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('\n--- NEW BAILEYS QR CODE ---');
            console.log('Scan the QR code below or visit /admin/qr to pair:');
            console.log(qr); // Logging the raw QR string as a fallback
            console.log('---------------------------\n');
            currentQR = qr;
        }

        if (connection === 'close') {
            const statusCode = (lastDisconnect?.error)?.output?.statusCode;
            const errorMsg = lastDisconnect?.error?.message || 'unknown error';
            const isConflict = lastDisconnect?.error?.data?.tag === 'conflict' || statusCode === DisconnectReason.connectionLost;
            
            // Should we reconnect?
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            
            console.log(`[Baileys] Connection closed: ${errorMsg} (Status: ${statusCode}). Reconnecting: ${shouldReconnect}`);
            
            if (shouldReconnect) {
                // Conflict detection (another session kicked this one)
                // Add jitter to avoid a "ping-pong" effect if two instances compete
                const delay = isConflict ? (30000 + Math.random() * 20000) : 3000;
                console.log(`[Baileys] Reconnecting in ${Math.round(delay/1000)}s... ${isConflict ? '(Conflict/Lost detected - with jitter)' : ''}`);
                
                // Cleanup to avoid memory leaks
                if (sock) {
                    try {
                        sock.ev.removeAllListeners('connection.update');
                        sock.ev.removeAllListeners('creds.update');
                        sock.ev.removeAllListeners('messages.upsert');
                    } catch (e) {}
                }

                setTimeout(() => {
                    console.log('[Baileys] Attempting reconnection...');
                    initBaileys().catch(err => console.error('[Baileys] Re-init failed:', err));
                }, delay);
            } else {
                console.log('[Baileys] Logged out. Manual intervention required (re-scan QR).');
                currentQR = '';
            }
        } else if (connection === 'open') {
            console.log('[Baileys] Connection successfully opened');
            global.wa_sock = sock; // Update global reference on success
            currentQR = ''; 
        }
    });

    // Save creds when updated
    sock.ev.on('creds.update', saveCreds);

    // 4. Handle incoming messages
    sock.ev.on('messages.upsert', async (m) => {
        try {
            if (m.type !== 'notify') return;
            
            for (const msg of m.messages) {
                if (!msg.message || msg.key.fromMe) continue; 
                
                const jid = msg.key.remoteJid;
                if (!jid || jid.includes('@g.us')) continue; // Ignore groups for now to save quota/noise

                let phone = jid.split('@')[0]; 
                if (!phone.startsWith('+')) phone = '+' + phone;
                
                const imageMessage = msg.message?.imageMessage || msg.message?.viewOnceMessageV2?.message?.imageMessage;
                
                if (imageMessage) {
                    console.log(`[Baileys] Image RX from ${phone}`);
                    try {
                        const replyText = await processImage(phone, imageMessage);
                        if (replyText) await sock.sendMessage(jid, { text: replyText });
                    } catch (err) {
                        console.error(`[Baileys] Error processing image from ${phone}:`, err.message);
                        await sock.sendMessage(jid, { text: "❌ Sorry, I had trouble processing that image. Please try again." });
                    }
                } else {
                    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || msg.message?.listResponseMessage?.title || '';
                    if (!text) continue;
                    
                    console.log(`[Baileys] Msg RX from ${phone}: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);

                    // --- Vuka Bridge: WhatsApp to GSM ---
                    try {
                        const relay = db.prepare('SELECT gsmMsisdn FROM relay_sessions WHERE jid = ?').get(jid);
                        if (relay) {
                            console.log(`[Vuka Bridge] Replying to GSM ${relay.gsmMsisdn}`);
                            await sendSMS(relay.gsmMsisdn, `[WhatsApp Reply from ${phone}]: ${text}`);
                        }
                    } catch (relayErr) {
                        console.error('[Baileys] Relay check failed:', relayErr.message);
                    }

                    try {
                        const replyText = await processMessage(phone, text);
                        if (replyText) {
                            await sock.sendMessage(jid, { text: replyText });
                        }
                    } catch (err) {
                        console.error(`[Baileys] Error processing message from ${phone}:`, err.message);
                        await sock.sendMessage(jid, { text: "❌ mARI is momentarily overwhelmed. Please type *MENU* in a few seconds." });
                    }
                }
            }
        } catch (globalErr) {
            console.error('[Baileys] Upsert handler CRITICAL error:', globalErr);
        }
    });

    // 5. Setup Supabase Realtime to listen for outbound `reply` changes
    setupRealtimeSubscription(sock);
}

function setupRealtimeSubscription(sockInstance) {
    const supabase = getSupabaseClient();
    supabase.channel('custom-update-channel')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'whatsapp_sessions' },
        async (payload) => {
            const oldReply = payload.old.reply;
            const newReply = payload.new.reply;

            // Simple diff to ensure we only send when `reply` is populated with a new message
            if (newReply && newReply !== oldReply) {
                const phone = payload.new.phone; // Assuming whatsapp_sessions has a phone column
                const jid = `${phone.replace('+', '')}@s.whatsapp.net`;
                console.log(`[Realtime Outbound] Sending to ${phone}: ${newReply}`);
                
                try {
                    await sockInstance.sendMessage(jid, { text: newReply });
                } catch (e) {
                    console.error(`Failed to send realtime outbound msg to ${jid}:`, e);
                }
            }
        }
      )
      .subscribe();
}

/**
 * Utility to get current QR code as HTML img tag
 */
export async function getQRAsHTML() {
    if (!currentQR) {
        return `<h3>No QR code available. Status: ${sock ? 'Connected' : 'Initializing'}</h3>`;
    }
    const dataUrl = await qrcode.toDataURL(currentQR);
    return `<h3>Scan this to connect Baileys:</h3><img src="${dataUrl}" style="width:300px;" />`;
}
