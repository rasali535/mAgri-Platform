import { getRecentListings, searchListings } from '../whatsapp/listingsStore.js';
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
        if (text === '' || L1 === '0' || L1 === 'MENU' || (depth > 1 && parts[parts.length - 1] === '0')) {
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

        if (stateData.state === 'VUKA_REGISTER_NAME') {
            const name = parts[parts.length - 1];
            if (!name || name === '0') {
                USSDService.setState(cleanMsisdn, 'IDLE');
                return USSDService.showMainMenu(cleanMsisdn);
            }
            const success = await VukaService.registerUser(cleanMsisdn, name);
            USSDService.setState(cleanMsisdn, 'IDLE');
            if (success) return `END Profile created, ${name}! Welcome to Vuka Social.`;
            return `END Error creating profile. Please try again.`;
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

        if (stateData.state === 'MARKETPLACE_INPUT') {
            const query = parts[parts.length - 1];
            if (query === '0') {
                USSDService.setState(cleanMsisdn, 'IDLE');
                return USSDService.showMainMenu(cleanMsisdn);
            }
            const listings = await searchListings(query, 3);
            let res = `CON *Marketplace Results: ${query}*\n`;
            if (listings.length === 0) res += "No matching listings found.";
            else listings.forEach((l, i) => { res += `${i+1}. ${l.crop_name || 'Crop'} - View online\n`; });
            res += `\n0. Back`;
            return res;
        }

        // --- Traditional Menu Logic (Lower Priority) ---
        if (L1 === '1') { // Dashboard
            return await USSDService.handleDashboard(cleanMsisdn);
        }

        if (L1 === '2') { // Marketplace
            if (depth === 1) return `CON *Marketplace*\n1. Recent Listings\n2. Search Crops\n\n0. Menu`;
            if (parts[1] === '1') {
                const listings = await getRecentListings(5);
                let res = `CON *Recent Listings*\n`;
                listings.slice(0, 4).forEach(l => { res += `• ${l.crop_name || 'Crop'} (+${l.phone})\n`; });
                res += `\n0. Menu`;
                return res;
            }
            if (parts[1] === '2') {
                USSDService.setState(cleanMsisdn, 'MARKETPLACE_INPUT');
                return `CON *Search Marketplace*\nEnter Crop Name:`;
            }
        }

        if (L1 === '5') { // Finance
            if (depth === 1) return `CON *Finance*\n1. Credit Score\n2. Apply for Loan\n3. Insurance\n\n0. Menu`;
            if (parts[1] === '1') return `END *Your Credit Score*\nScore: 780 (A+)\nStatus: Eligible for 5,000 credit limit.`;
            if (parts[1] === '2') return `END *Loan Application*\nVisit mAgri.com/finance to complete your application.`;
            if (parts[1] === '3') return `END *mAgri Insurance*\nProtect your harvest today! Dial *145# to pay premiums.`;
        }

        if (L1 === '6') { // Weather
            return `CON *Weather*\nBorehole, Botswana:\nSunny, 28°C\nChance of rain: 10%\n\n0. Menu`;
        }

        if (L1 === '7') { // Community
            return `CON *Community*\nJoin our farmer forum on WhatsApp or Web!\nLink: mAgri.com/community\n\n0. Menu`;
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
                if (!user) {
                    USSDService.setState(cleanMsisdn, 'VUKA_REGISTER_NAME');
                    return `CON *My Profile*\nYou are not registered.\n\nReply with your Name:`;
                }
                return `END *My Profile*\nName: ${user.name}\nRole: ${user.role || 'Farmer'}\nBio: ${user.bio || 'None'}\n\nWA: ${user.whatsapp_number ? '+'+user.whatsapp_number : 'Not Linked'}`;
            }
        }

        if (L1 === '10') { // Mpotsa
            USSDService.setState(cleanMsisdn, 'MPOTSA_WAITING');
            return `CON *Mpotsa Universal Q&A*\nAsk about Farming, Health, Law, Jobs or anything:`;
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
        let linkedWhatsapp = null;
        try {
            // 1. Check vuka_users (USSD/Vuka registrations)
            const { data: vukaUser } = await supabase.from('vuka_users').select('name, whatsapp_number').eq('msisdn', cleanMsisdn).maybeSingle();
            if (vukaUser?.name) displayName = vukaUser.name;
            if (vukaUser?.whatsapp_number) linkedWhatsapp = vukaUser.whatsapp_number;
            
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
            subStatus = await PaymentService.checkSubscription(cleanMsisdn);
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

        let role = 'Farmer';
        let location = 'Unknown';
        try {
            const { data: vukaDetails } = await supabase.from('vuka_users').select('role, lat, lng').eq('msisdn', cleanMsisdn).maybeSingle();
            if (vukaDetails?.role) role = vukaDetails.role.charAt(0).toUpperCase() + vukaDetails.role.slice(1);
            if (vukaDetails?.lat && vukaDetails?.lng) location = `${vukaDetails.lat.toFixed(2)}, ${vukaDetails.lng.toFixed(2)}`;
        } catch (e) { /* ignore */ }

        let response = `CON *mARI Dashboard*\n`;
        response += `User: ${displayName}\n`;
        response += `Role: ${role}\n`;
        if (location !== 'Unknown') response += `Loc: ${location}\n`;
        if (linkedWhatsapp && linkedWhatsapp !== cleanMsisdn) {
            response += `WA: +${linkedWhatsapp}\n`;
        }
        response += `Status: ${subStatus.active ? '✅ ACTIVE (' + subStatus.planType + ')' : '❌ INACTIVE'}\n`;
        response += `Total Scans: ${scanCount}\n`;
        response += `\n0. Back to Menu`;
        return response;
    },

    showMainMenu: (msisdn) => {
        const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        let response = `CON 🌱 *mARI mAgri Platform*\n`;
        response += `1. Dashboard\n`;
        response += `2. Marketplace\n`;
        response += `4. AI Advisor\n`;
        response += `5. Finance\n`;
        response += `6. Weather\n`;
        response += `7. Community\n`;
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
