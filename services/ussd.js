import { PaymentService } from './payment.js';
import { VukaService } from './vuka.js';
import { MpotsaService } from './mpotsa.js';
import { DashboardService } from './dashboard.js';
import db from './database.js';
import { getSupabaseClient } from '../src/lib/supabaseClient.js';
import { sendSMS } from '../whatsapp/africa.js';
import { askGemini } from './ai.js';
import { getRecentListings, searchListings } from '../whatsapp/listingsStore.js';
import { getLang } from '../whatsapp/translations.js';

const normalizeMsisdn = (phone) => (phone || '').toString().replace(/\+/g, '').trim();
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://navajowhite-monkey-252201.hostingersite.com';

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
        // or if the LAST part of a multi-depth text is 0
        // Navigation: handle '0' as back or menu
        const lastInput = parts[parts.length - 1];
        if (text === '' || L1 === 'MENU') {
            USSDService.setState(cleanMsisdn, 'IDLE');
            return USSDService.showMainMenu(cleanMsisdn);
        }

        if (depth > 0 && lastInput === '0') {
            // Clear current state when navigating back unless we specifically want to stay (rare)
            USSDService.setState(cleanMsisdn, 'IDLE');
            
            if (depth === 1) {
                // At main menu level selecting 0? Just show main menu again
                return USSDService.showMainMenu(cleanMsisdn);
            } else {
                // Go back one level: re-process without the last two parts (e.g. 2*1*0 -> 2)
                const newParts = parts.slice(0, -2);
                const newText = newParts.join('*');
                console.log(`[USSD] Back button pressed. Re-routing: ${newText || 'Menu'}`);
                return await USSDService.handleRequest(msisdn, newText);
            }
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
            if (!name || name === '0' || name === 'CANCEL') {
                USSDService.setState(cleanMsisdn, 'IDLE');
                return USSDService.showMainMenu(cleanMsisdn);
            }
            const success = await VukaService.registerUser(cleanMsisdn, name);
            if (success) {
                USSDService.setState(cleanMsisdn, 'IDLE');
                return `END Profile created, ${name}! Welcome to Vuka Social.`;
            } else {
                // If registration failed (e.g. invalid name), ask again
                return `CON *Vuka Registration*\nInvalid name. Please enter your full name (no numbers):\n\n0. Cancel`;
            }
        }

        if (stateData.state === 'VUKA_SEARCH_FRIEND') {
            const query = parts[parts.length - 1];
            if (query === '0') {
                USSDService.setState(cleanMsisdn, 'IDLE');
                return USSDService.showMainMenu(cleanMsisdn);
            }
            const users = await VukaService.searchUsers(query);
            if (users.length === 0) {
                return `CON No users found for "${query}".\n\nTry another name (or 0 for Menu):`;
            }
            USSDService.setState(cleanMsisdn, 'VUKA_FRIEND_LIST', { users });
            let res = `CON *Select to Add Friend*\n`;
            users.forEach((u, i) => { res += `${i+1}. ${u.name} (${u.msisdn})\n`; });
            res += `\n0. Back`;
            return res;
        }

        if (stateData.state === 'VUKA_FRIEND_LIST') {
            const choice = parseInt(parts[parts.length - 1]);
            const users = stateData.data.users;
            if (choice > 0 && choice <= users.length) {
                const friend = users[choice - 1];
                await VukaService.addFriend(cleanMsisdn, friend.msisdn);
                USSDService.setState(cleanMsisdn, 'IDLE');
                return `END Friend request sent to ${friend.name}!`;
            }
            USSDService.setState(cleanMsisdn, 'IDLE');
            return USSDService.showMainMenu(cleanMsisdn);
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
            // '0' is already handled by the global back logic above
            
            const result = await MpotsaService.search(query, cleanMsisdn);
            // Optimization: If it's a short answer (under ~160 chars), we show it directly.
            // If it's long, Mpotsa already sent an SMS, so we show a clear snippet.
            let displayMsg = result.text;
            if (result.type === 'LONG') {
                displayMsg = result.text.substring(0, 150) + "... [Full answer sent via SMS]";
            }
            return `CON *Mpotsa Result* 📚\n\n${displayMsg}\n\n1. Ask another question\n0. Back to Menu`;
        }

        if (stateData.state === 'MARKETPLACE_INPUT') {
            const query = parts[parts.length - 1];
            if (query === '0') {
                USSDService.setState(cleanMsisdn, 'IDLE');
                return USSDService.showMainMenu(cleanMsisdn);
            }
            const listings = await searchListings(query, 3);
            let res = `CON *${query}* results:\n`;
            if (listings.length === 0) res += "No matching listings found.";
            else listings.forEach((l, i) => { res += `${i+1}. ${l.crop_name || 'Crop'} - View online\n`; });
            res += `\n0. Back`;
            return res;
        }

        // --- Traditional Menu Logic (Lower Priority) ---
        if (L1 === '1') return await USSDService.handleDashboard(cleanMsisdn);

        if (L1 === '2') { // Marketplace
            if (depth === 1) return `CON ` + T.marketplace_menu;
            if (parts[1] === '1') {
                const listings = await getRecentListings(5);
                let res = `CON *Recent Listings*\n`;
                listings.slice(0, 4).forEach(l => { res += `• ${l.crop_name || 'Crop'} (+${l.phone})\n`; });
                res += `\n0. Menu`;
                return res;
            }
            if (parts[1] === '2') {
                USSDService.setState(cleanMsisdn, 'MARKETPLACE_INPUT');
                return `CON ` + T.marketplace_prompt;
            }
        }

        if (L1 === '3') { // Crop Scan
            if (depth === 1) return `CON *Crop Scan*\n1. Web App Link\n2. WhatsApp Link\n\n0. Menu`;
            if (parts[1] === '1') {
                const webUrl = `${WEBAPP_URL}/diagnose`;
                await sendSMS(cleanMsisdn, `mAgri: Use this link for Web Crop Scan: ${webUrl}`);
                return `END A link to the Web App Crop Scan has been sent via SMS.`;
            }
            if (parts[1] === '2') {
                const botPhone = process.env.WHATSAPP_NUMBER || '26771383838'; // Fallback
                const waLink = `https://wa.me/${botPhone.replace(/\+/g,'')}?text=Scan`; 
                await sendSMS(cleanMsisdn, `mAgri: Use this link for WhatsApp Crop Scan: ${waLink}`);
                return `END A link to the WhatsApp Crop Scan has been sent via SMS.`;
            }
        }

        if (L1 === '4') { // Ask mARI
            USSDService.setState(cleanMsisdn, 'USSD_AI_ADVISOR');
            return `CON ` + T.agronomist_prompt;
        }

        if (L1 === '5') { // Finance
            if (depth === 1) return `CON ` + T.credit_menu;
            if (parts[1] === '1') return `END ` + T.credit_score('780');
            return `END *mARI Finance*\nVisit the web app to manage your applications.`;
        }

        if (L1 === '6') { // Weather
            return `CON ` + T.weather_info + `\n\n0. Menu`;
        }

        if (L1 === '7') { // Community
            return `CON ` + T.community_info(WEBAPP_URL) + `\n\n0. Menu`;
        }

        if (L1 === '8') { // Vuka
            if (depth === 1) return `CON ` + T.vuka_menu;
            if (parts[1] === '1') {
                const user = await VukaService.getUser(cleanMsisdn);
                if (!user) {
                    USSDService.setState(cleanMsisdn, 'VUKA_REGISTER_NAME');
                    return `CON ` + T.vuka_register_prompt;
                }
                const friends = await VukaService.getFriends(cleanMsisdn);
                return `END ` + T.vuka_profile(user, friends.length);
            }
            if (parts[1] === '2') { // Social Feed
                const posts = await VukaService.getPosts();
                let feed = `CON *Vuka Feed*\n`;
                posts.slice(0, 3).forEach(p => { feed += `• ${p.content.substring(0, 30)}...\n`; });
                feed += `\n0. Back`;
                return feed;
            }
            if (parts[1] === '5') {
                USSDService.setState(cleanMsisdn, 'VUKA_SEARCH_FRIEND');
                return `CON ` + T.vuka_search_prompt;
            }
            return `CON *Vuka Groups*\nFeature coming soon to USSD.\n\n0. Back`;
        }

        if (L1 === '9') { // Language
            if (depth === 1) {
                return `CON ` + T.change_lang;
            }
            if (depth === 2) {
                const choice = parts[1];
                const langMap = { '1': 'en', '2': 'tn', '3': 'fr', '4': 'ny', '5': 'be' };
                const newLang = langMap[choice];
                if (newLang) {
                    try {
                        db.prepare('UPDATE users SET language = ? WHERE msisdn = ?').run(newLang, cleanMsisdn);
                    } catch (e) {
                         console.warn('[USSD] Language update failed:', e.message);
                    }
                    USSDService.setState(cleanMsisdn, 'IDLE');
                    return `END Language updated to ${newLang === 'en' ? 'English' : newLang === 'tn' ? 'Setswana' : newLang}. Dial again to use new language.`;
                } else {
                    return `CON Invalid choice.\n0. Back`;
                }
            }
        }

        if (L1 === '10') { // Mpotsa
            USSDService.setState(cleanMsisdn, 'MPOTSA_WAITING');
            return `CON ` + T.mpotsa_prompt;
        }

        if (L1 === '11') { // Payments
            if (depth === 1) return `CON ` + T.subscription_info + `\n1. Monthly (20 BWP)\n2. Yearly (200 BWP)\n0. Menu`;
            const choice = parts[depth-1];
            const planType = choice === '1' ? 'MONTHLY' : 'YEARLY';
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

    handleDashboard: async (cleanMsisdn) => {
        const data = await DashboardService.getData(cleanMsisdn);
        const { profile, subscription, stats } = data;
        
        // Get lang for dashboard
        let lang = profile.language || 'en';
        const T = getLang(lang);

        return `CON ` + T.dashboard(profile, subscription, stats) + `\n\n0. Menu`;
    },

    showMainMenu: (msisdn) => {
        const cleanMsisdn = normalizeMsisdn(msisdn);
        let lang = 'en';
        try {
            const user = db.prepare('SELECT language FROM users WHERE msisdn = ?').get(cleanMsisdn);
            if (user && user.language) lang = user.language;
        } catch (e) {}

        const T = getLang(lang);
        const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        let response = T.ussd_menu; 
        // If ussd_menu doesn't start with CON (it does in translation.js), add it.
        if (!response.startsWith('CON')) response = 'CON ' + response;
        response += `\n\n📅 ${dateStr}`;
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
