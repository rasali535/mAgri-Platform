import db from './database.js';
import { VukaService } from './vuka.js';
import { MpotsaService } from './mpotsa.js';
import { PaymentService } from './payment.js';
import { getLang } from '../whatsapp/translations.js';
import { askGemini } from './ai.js';
import { sendSMS } from '../whatsapp/africa.js';
import { getSupabaseClient } from '../src/lib/supabaseClient.js';

const normalizeMsisdn = (phone) => (phone || '').toString().replace(/\+/g, '').trim();

export const USSDService = {
    handleRequest: async (msisdn, text) => {
        const cleanMsisdn = normalizeMsisdn(msisdn);
        // Normalize text (handle cumulative parts from AT)
        const parts = (text || '').toString().trim().split('*').filter(p => p !== '');
        const depth = parts.length;
        const L1 = parts[0];
        const stateData = USSDService.getState(cleanMsisdn);
        
        console.log(`[USSD] ${cleanMsisdn} | Raw: "${text}" | Parts: ${JSON.stringify(parts)} | L1: ${L1} | State: ${stateData.state}`);
        
        // Reset state if text is empty or starts with 0 (Menu)
        if (text === '' || L1 === '0' || L1 === 'MENU') {
            USSDService.setState(cleanMsisdn, 'IDLE');
            return USSDService.showMainMenu(cleanMsisdn);
        }

        // --- State Handle (Highest Priority) ---
        if (stateData.state === 'VUKA_RELAY_RECIPIENT') {
            const recipient = parts[parts.length - 1];
            USSDService.setState(cleanMsisdn, 'VUKA_RELAY_MESSAGE', { recipient });
            return `CON *WhatsApp Relay*\nEnter Message for ${recipient}:`;
        }
        
        if (stateData.state === 'VUKA_RELAY_MESSAGE') {
            const message = parts[parts.length - 1];
            const recipient = stateData.data.recipient;
            await VukaService.relayToWhatsApp(cleanMsisdn, recipient, message);
            USSDService.setState(cleanMsisdn, 'IDLE');
            return `END Your message has been relayed to WhatsApp for ${recipient}.`;
        }

        if (stateData.state === 'PAYMENT_OTP') {
            const otp = parts[parts.length - 1];
            const res = await PaymentService.validateOTP(cleanMsisdn, stateData.data.payToken, otp, stateData.data.planType);
            USSDService.setState(cleanMsisdn, 'IDLE');
            if (res.success) return `END SUCCESS: ${res.message}`;
            return `END FAILED: ${res.error}`;
        }

        if (stateData.state === 'USSD_AI_ADVISOR') {
            const query = parts[parts.length - 1];
            if (query === '0') {
                USSDService.setState(cleanMsisdn, 'IDLE');
                return USSDService.showMainMenu(cleanMsisdn);
            }
            try {
                const aiResponse = await askGemini(
                    [{ role: 'user', parts: [{ text: query }] }],
                    "You are mARI, a concise AI agronomist for USSD. Keep reply under 130 characters."
                );
                // Trim to 130 chars to keep USSD screen clean
                const trimmed = aiResponse.length > 130 ? aiResponse.substring(0, 127) + '...' : aiResponse;
                return `CON mARI: ${trimmed}\n\nAsk another (or 0 for Menu):`;
            } catch (e) {
                console.error('[USSD AI Error]', e.message);
                return `CON *mARI AI Advisor*\nService busy, try again.\n\nType your question or 0 for Menu:`;
            }
        }

        if (stateData.state === 'MPOTSA_WAITING') {
            const query = parts[parts.length - 1];
            if (query === '0') {
                USSDService.setState(cleanMsisdn, 'IDLE');
                return USSDService.showMainMenu(cleanMsisdn);
            }
            const result = await MpotsaService.search(query, cleanMsisdn);
            return `CON ${result.text}\n\nAsk another or 0 for Menu:`;
        }

        // --- Traditional Menu Logic (Lower Priority) ---
        if (L1 === '1') { // Dashboard
            return await USSDService.handleDashboard(cleanMsisdn);
        }

        if (L1 === '4') { // AI Advisor
            USSDService.setState(cleanMsisdn, 'USSD_AI_ADVISOR');
            return `CON *mARI AI Advisor*\nAsk any farming question:`;
        }

        if (L1 === '8') { // Vuka
            if (depth === 1) {
                return `CON *Vuka Social*\n1. My Profile\n2. Find Friends\n3. Group Chats\n4. WhatsApp Relay`;
            } else if (parts[1] === '4') { // WhatsApp Relay
                USSDService.setState(cleanMsisdn, 'VUKA_RELAY_RECIPIENT');
                return `CON *WhatsApp Relay*\nEnter Recipient MSISDN (e.g. 267...):`;
            }
            if (parts[1] === '1') {
                const user = await VukaService.getUser(cleanMsisdn);
                if (!user) return `CON *My Profile*\nYou are not registered. Reply with your Name:`;
                if (depth === 3) {
                    await VukaService.registerUser(cleanMsisdn, parts[2]);
                    return `END Profile created, ${parts[2]}!`;
                }
                return `END *My Profile*\nName: ${user.name}\nBio: ${user.bio || 'None'}`;
            }
        }

        if (L1 === '10') { // Mpotsa
            USSDService.setState(cleanMsisdn, 'MPOTSA_WAITING');
            return `CON *Mpotsa Q&A*\nAsk about Health, Law, or Jobs:`;
        }

        if (L1 === '11') { // Payments
            if (depth === 1) return `CON *Subscriptions*\n1. Monthly (20 BWP)\n2. Yearly (200 BWP)`;
            const planType = parts[ depth-1 ] === '1' ? 'MONTHLY' : 'YEARLY';
            const amount = planType === 'MONTHLY' ? 20 : 200;
            const payRes = await PaymentService.initiatePayment(cleanMsisdn, amount, planType);
            if (payRes.success) {
                USSDService.setState(cleanMsisdn, 'PAYMENT_OTP', { payToken: payRes.payToken, planType });
                return `CON *Subscription Payment*\n1. Dial *145# to generate OTP\n2. Enter the 6-digit OTP here:`;
            }
            return `END Initiation error. Try again later.`;
        }

        return `CON Invalid option or feature coming soon.\n0. Menu`;
    },

    handleDashboard: async (msisdn) => {
        const cleanMsisdn = normalizeMsisdn(msisdn);
        const supabase = getSupabaseClient();
        
        // --- Resolve display name from Supabase (source of truth) ---
        let displayName = null;
        try {
            // 1. Check vuka_users (USSD/Vuka registrations)
            const { data: vukaUser } = await supabase.from('vuka_users').select('name').eq('msisdn', cleanMsisdn).maybeSingle();
            if (vukaUser?.name) displayName = vukaUser.name;
            
            // 2. Fallback: WhatsApp session (has display name from WA profile)
            if (!displayName) {
                const { data: waSession } = await supabase.from('whatsapp_sessions').select('email').eq('phone', cleanMsisdn).maybeSingle();
                if (waSession?.email) displayName = waSession.email.split('@')[0];
            }
        } catch (e) {
            console.warn('[USSD Dashboard] Supabase name lookup failed:', e.message);
        }
        
        // 3. Final fallback: local SQLite
        if (!displayName) {
            const localUser = db.prepare('SELECT name FROM users WHERE msisdn = ?').get(cleanMsisdn);
            displayName = localUser?.name || 'Guest';
        }

        // --- Subscription: check Supabase first, then local SQLite ---
        let subStatus = { active: false, planType: null };
        try {
            const { data: sbSub } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('userId', cleanMsisdn)
                .maybeSingle();
            if (sbSub) {
                const expired = sbSub.expiryDate && new Date(sbSub.expiryDate) < new Date();
                subStatus = { active: sbSub.status === 'ACTIVE' && !expired, planType: sbSub.planType };
            }
        } catch (e) { /* ignore, fall through to local */ }
        
        if (!subStatus.active) {
            // Local fallback (USSD OTP-activated subscriptions)
            subStatus = PaymentService.checkSubscription(cleanMsisdn);
        }

        // --- Scan count from Supabase resources ---
        let scanCount = 0;
        try {
            const { count } = await supabase
                .from('resources')
                .select('*', { count: 'exact', head: true })
                .eq('phone', cleanMsisdn)
                .eq('type', 'Diagnosis');
            scanCount = count || 0;
        } catch (e) {
            console.warn('[USSD Dashboard] Scan count lookup failed:', e.message);
        }

        let response = `CON *mARI Dashboard*\n`;
        response += `User: ${displayName}\n`;
        response += `Status: ${subStatus.active ? '✅ ACTIVE (' + subStatus.planType + ')' : '❌ INACTIVE'}\n`;
        response += `Total Scans: ${scanCount}\n`;
        response += `\n0. Back to Menu`;
        return response;
    },

    showMainMenu: (msisdn) => {
        const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        let response = `CON 🌱 *mARI mAgri Platform*\n`;
        response += `1. Dashboard\n`;
        response += `4. Ask mARI (AI Advisor)\n`;
        response += `8. Vuka Social\n`;
        response += `10. Mpotsa Q&A\n`;
        response += `11. Subscription\n`;
        response += `📅 ${dateStr}`;
        return response;
    },

    getState: (msisdn) => {
        const row = db.prepare('SELECT state, data FROM ussd_states WHERE msisdn = ?').get(msisdn);
        if (!row) return { state: 'IDLE', data: {} };
        try {
            return { state: row.state, data: JSON.parse(row.data || '{}') };
        } catch (e) {
            return { state: 'IDLE', data: {} };
        }
    },

    setState: (msisdn, state, data = {}) => {
        db.prepare('INSERT OR REPLACE INTO ussd_states (msisdn, state, data, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)')
          .run(msisdn, state, JSON.stringify(data));
    }
};
