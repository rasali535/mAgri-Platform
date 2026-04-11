/**
 * services/ussd.js
 * Modular USSD handler with State Machine logic.
 */
import db from './database.js';
import { VukaService } from './vuka.js';
import { MpotsaService } from './mpotsa.js';
import { PaymentService } from './payment.js';
import { getLang } from '../whatsapp/translations.js';

export const USSDService = {
    handleRequest: async (msisdn, text) => {
        const parts = (text || '').toString().trim().split('*');
        const depth = parts.length;
        const L1 = parts[0];
        const stateData = USSDService.getState(msisdn);
        
        console.log(`[USSD] ${msisdn} | Text: "${text}" | State: ${stateData.state}`);
        
        let response = '';


        // Reset state if text is empty or starts with 0 (Menu)
        if (text === '' || L1 === '0' || L1 === 'MENU') {
            USSDService.setState(msisdn, 'IDLE');
            return USSDService.showMainMenu(msisdn);
        }

        // --- State Handle ---
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

        // --- Traditional Menu Logic ---
        if (L1 === '8') { // Vuka
            if (depth === 1) {
                return `CON *Vuka Social*\n1. My Profile\n2. Find Friends\n3. Group Chats\n4. WhatsApp Relay`;
            } else if (parts[1] === '4') { // WhatsApp Relay
                USSDService.setState(msisdn, 'VUKA_RELAY_RECIPIENT');
                return `CON *WhatsApp Relay*\nEnter Recipient MSISDN (e.g. 267...):`;
            }
            // Other Vuka logic (simplified for briefness)
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
            if (depth === 1) return `CON *Mpotsa Q&A*\nAsk anything (Health, Law, Jobs, Education):`;
            const query = parts.slice(1).join(' ');
            const result = await MpotsaService.search(query, msisdn);
            return `END ${result.text}`;
        }

        if (L1 === '11') { // Payments (New Option)
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

    showMainMenu: (msisdn) => {
        const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        let response = `CON 🌱 *mARI Platform (rasali)*\n`;
        response += `1. Dashboard\n`;
        response += `8. Vuka Social\n`;
        response += `10. Mpotsa Q&A\n`;
        response += `11. Subscription\n`;
        response += `📅 ${dateStr}`;
        return response;
    },

    getState: (msisdn) => {
        const row = db.prepare('SELECT state, data FROM ussd_states WHERE msisdn = ?').get(msisdn);
        if (!row) return { state: 'IDLE', data: {} };
        return { state: row.state, data: JSON.parse(row.data || '{}') };
    },

    setState: (msisdn, state, data = {}) => {
        db.prepare('INSERT OR REPLACE INTO ussd_states (msisdn, state, data, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)')
          .run(msisdn, state, JSON.stringify(data));
    }
};
