import { makeWASocket, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';
import { useSupabaseAuthState } from './supabaseAuthState.js';
import { processMessage, processImage } from './bot.js';
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
        browser: ['Pameltex Tech', 'Chrome', '1.0.0'],
    });

    // 3. Handle Connection Updates
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('\n--- NEW BAILEYS QR CODE ---');
            console.log('Scan the QR code below or visit /admin/qr to pair:');
            console.log(qr); // Logging the raw QR string as a fallback
            console.log('---------------------------\n');
            currentQR = qr;
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect);
            if (shouldReconnect) {
                initBaileys();
            } else {
                console.log('Logged out. Please re-scan QR.');
            }
        } else if (connection === 'open') {
            console.log('Baileys opened connection');
            currentQR = ''; // connection established, no need for QR
        }
    });

    // Save creds when updated
    sock.ev.on('creds.update', saveCreds);

    // 4. Handle incoming messages
    sock.ev.on('messages.upsert', async (m) => {
        if (m.type !== 'notify') return;
        
        for (const msg of m.messages) {
            if (!msg.message || msg.key.fromMe) continue; // ignore outgoing
            const jid = msg.key.remoteJid;
            let phone = jid.split('@')[0]; 
            if (!phone.startsWith('+')) phone = '+' + phone;
            
            // Check if it's an image
            const imageMessage = msg.message?.imageMessage;
            if (imageMessage) {
                console.log(`[Baileys Image] from=${phone}`);
                const replyText = await processImage(phone, imageMessage);
                if (replyText) {
                    await sock.sendMessage(jid, { text: replyText });
                }
            } else {
                // Must be text
                const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
                if (!text) continue;
                
                console.log(`[Baileys Text] from=${phone} text="${text}"`);
                const replyText = await processMessage(phone, text);
                if (replyText) {
                    await sock.sendMessage(jid, { text: replyText });
                }
            }
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
