import db from './database.js';
import { VukaService } from './vuka.js';
import { MpotsaService } from './mpotsa.js';
import { PaymentService } from './payment.js';
import { getLang } from '../whatsapp/translations.js';
import { askGemini } from './ai.js';
import { sendSMS } from '../whatsapp/africa.js';
import { getSupabaseClient } from '../src/lib/supabaseClient.js';

export const USSDService = {
    handleRequest: async (msisdn, text) => {
        // Normalize text (handle cumulative parts from AT)
        const parts = (text || '').toString().trim().split('*').filter(p => p !== '');
        const depth = parts.length;
        const L1 = parts[0];
        const stateData = USSDService.getState(msisdn);
        
        console.log(`[USSD] ${msisdn} | Raw: "${text}" | Parts: ${JSON.stringify(parts)} | L1: ${L1} | State: ${stateData.state}`);
        
        // Reset state if text is empty or starts with 0 (Menu)
        if (text === '' || L1 === '0' || L1 === 'MENU') {
            USSDService.setState(msisdn, 'IDLE');
            return USSDService.showMainMenu(msisdn);
        }

        // --- State Handle (Highest Priority) ---
        if (stateData.state === 'VUKA_RELAY_RECIPIENT') {
            const recipient = parts[parts.length - 1];
            USSDService.setState(msisdn, 'VUKA_RELAY_MESSAGE', { recipient });
            return `CON *WhatsApp Relay*\nEnter Message for ${recipient}:`;
        }
        
        if (stateData.state === 'VUKA_RELAY_MESSAGE') {
            const message = parts[parts.length - 1];
            const recipient = stateData.data.recipient;
            await VukaService.relayToWhatsApp(msisdn, recipient, message);
            USSDService.setState(msisdn, 'IDLE');
            return `END Your message has been relayed to WhatsApp for ${recipient}.`;
        }

        if (stateData.state === 'PAYMENT_OTP') {
            const otp = parts[parts.length - 1];
            const res = await PaymentService.validateOTP(msisdn, stateData.data.payToken, otp, stateData.data.planType);
            USSDService.setState(msisdn, 'IDLE');
            if (res.success) return `END SUCCESS: ${res.message}`;
            return `END FAILED: ${res.error}`;
        }

        if (stateData.state === 'USSD_AI_ADVISOR') {
            const query = parts[parts.length - 1];
            if (query === '0') {
                USSDService.setState(msisdn, 'IDLE');
                return USSDService.showMainMenu(msisdn);
            }
            try {
                // Ensure we use the correct format for the new ai.js (array of parts)
                const aiResponse = await askGemini([{ parts: [{ text: query }] }], "You are mARI, a concise AI agronomist for USSD. Max 140 chars.");
                if (aiResponse.length > 160) {
                    await sendSMS(msisdn, `mARI Advisor: ${aiResponse}`);
                    return `CON mARI: Response sent via SMS to save space.\n\nAsk another question or 0 for Menu:`;
                }
                return `CON mARI: ${aiResponse}\n\nAsk another or 0 for Menu:`;
            } catch (e) {
                console.error('[USSD AI Error]', e);
                return `CON mARI: Sorry, AI service is busy. 0 for Menu.`;
            }
        }

        if (stateData.state === 'MPOTSA_WAITING') {
            const query = parts[parts.length - 1];
            if (query === '0') {
                USSDService.setState(msisdn, 'IDLE');
                return USSDService.showMainMenu(msisdn);
            }
            const result = await MpotsaService.search(query, msisdn);
            return `CON ${result.text}\n\nAsk another or 0 for Menu:`;
        }

        // --- Traditional Menu Logic (Lower Priority) ---
        if (L1 === '1') { // Dashboard
            return await USSDService.handleDashboard(msisdn);
        }

        if (L1 === '4') { // AI Advisor
            USSDService.setState(msisdn, 'USSD_AI_ADVISOR');
            return `CON *mARI AI Advisor*\nAsk any farming question:`;
        }

        if (L1 === '8') { // Vuka
            if (depth === 1) {
                return `CON *Vuka Social*\n1. My Profile\n2. Find Friends\n3. Group Chats\n4. WhatsApp Relay`;
            } else if (parts[1] === '4') { // WhatsApp Relay
                USSDService.setState(msisdn, 'VUKA_RELAY_RECIPIENT');
                return `CON *WhatsApp Relay*\nEnter Recipient MSISDN (e.g. 267...):`;
            }
            if (parts[1] === '1') {
                const user = await VukaService.getUser(msisdn);
                if (!user) return `CON *My Profile*\nYou are not registered. Reply with your Name:`;
                if (depth === 3) {
                    await VukaService.registerUser(msisdn, parts[2]);
                    return `END Profile created, ${parts[2]}!`;
                }
                return `END *My Profile*\nName: ${user.name}\nBio: ${user.bio || 'None'}`;
            }
        }

        if (L1 === '10') { // Mpotsa
            USSDService.setState(msisdn, 'MPOTSA_WAITING');
            return `CON *Mpotsa Q&A*\nAsk about Health, Law, or Jobs:`;
        }

        if (L1 === '11') { // Payments
            if (depth === 1) return `CON *Subscriptions*\n1. Monthly (20 BWP)\n2. Yearly (200 BWP)`;
            const planType = parts[ depth-1 ] === '1' ? 'MONTHLY' : 'YEARLY';
            const amount = planType === 'MONTHLY' ? 20 : 200;
            const payRes = await PaymentService.initiatePayment(msisdn, amount, planType);
            if (payRes.success) {
                USSDService.setState(msisdn, 'PAYMENT_OTP', { payToken: payRes.payToken, planType });
                return `CON *Subscription Payment*\n1. Dial *145# to generate OTP\n2. Enter the 6-digit OTP here:`;
            }
            return `END Initiation error. Try again later.`;
        }

        return `CON Invalid option or feature coming soon.\n0. Menu`;
    },

    handleDashboard: async (msisdn) => {
        const user = db.prepare('SELECT name FROM users WHERE msisdn = ?').get(msisdn);
        const sub = PaymentService.checkSubscription(msisdn);
        
        let response = `CON *mARI Dashboard*\n`;
        response += `User: ${user ? user.name : 'Guest'}\n`;
        response += `Status: ${sub.active ? '✅ ACTIVE (' + sub.planType + ')' : '❌ INACTIVE'}\n`;
        
        try {
            const supabase = getSupabaseClient();
            const { count } = await supabase
                .from('resources')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'Diagnosis'); // Assuming 'Diagnosis' status means a crop scan
            
            response += `Total Scans: ${count || 0}\n`;
        } catch (e) {
            console.error('[USSD Dashboard] Supabase error:', e.message);
        }

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
