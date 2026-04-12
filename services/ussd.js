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
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://orangered-clam-470152.hostingersite.com';
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '26771383838';

const resolveUssdPath = (text) => {
    if (!text) return '';
    const parts = (text || '').toString().split('*').filter(p => p !== '');
    const stack = [];
    for (const part of parts) {
        if (part === '0' || part.toUpperCase() === 'BACK') {
            if (stack.length > 0) stack.pop();
        } else if (part.toUpperCase() === 'MENU') {
            stack.length = 0; // Clear all
        } else {
            stack.push(part);
        }
    }
    return stack.join('*');
};

export const USSDService = {
    handleRequest: async (msisdn, rawText) => {
        const cleanMsisdn = normalizeMsisdn(msisdn);
        
        // Handle explicit session reset or back navigation in state
        const rawParts = (rawText || '').toString().split('*').filter(p => p !== '');
        const lastInput = rawParts[rawParts.length - 1];
        if (lastInput === '0' || (lastInput && (lastInput.toUpperCase() === 'MENU' || lastInput.toUpperCase() === 'BACK'))) {
            USSDService.setState(cleanMsisdn, 'IDLE');
        }

        let text = resolveUssdPath(rawText);
        
        // Normalize text (handle cumulative parts from AT)
        let parts = text.split('*').filter(p => p !== '');
        
        // Auto-jump logic: If in a terminal menu (Dashboard, Weather, etc.) and player types another root option
        const terminalMenus = ['1', '5', '6', '7']; // Menus that don't have nested sub-choices or where we want to allow quick jumping
        if (parts.length > 1 && terminalMenus.includes(parts[0])) {
            const lastPart = parts[parts.length - 1];
            const rootMenus = ['1','2','3','4','5','6','7','8','9','10','11'];
            if (rootMenus.includes(lastPart)) {
                console.log(`[USSD] Auto-jumping from ${parts[0]} to ${lastPart}`);
                parts = [lastPart];
                text = lastPart;
            }
        }

        const depth = parts.length;
        const lastEnter = parts[depth-1];

        // Global Back/Menu Logic
        if (depth > 1) {
            if (lastEnter === '00') {
                USSDService.setState(cleanMsisdn, 'IDLE');
                return await USSDService.handleRequest(msisdn, '');
            }
            if (lastEnter === '0') {
                const backText = parts.slice(0, -2).join('*');
                return await USSDService.handleRequest(msisdn, backText);
            }
        }

        const stateData = USSDService.getState(cleanMsisdn);
        const T = getLang(stateData.data.lang || 'en');
        
        // Define convenience variables for deep navigation
        const L1 = parts[0];
        const L2 = parts[1];
        const L3 = parts[2];
        const L4 = parts[3];

        console.log(`[USSD] ${cleanMsisdn} | Raw: "${rawText}" | Resolved: "${text}" | Parts: ${JSON.stringify(parts)} | L1: ${L1} | State: ${stateData.state}`);
        
        if (text === '' || text === '0' || text === '*920*49#') {
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
            if (!name || name === '0' || name === 'CANCEL') {
                USSDService.setState(cleanMsisdn, 'IDLE');
                return USSDService.showMainMenu(cleanMsisdn);
            }
            const success = await VukaService.registerUser(cleanMsisdn, name);
            if (success) {
                USSDService.setState(cleanMsisdn, 'IDLE');
                return `CON Profile created, ${name}! Welcome to Vuka Social.\n\n0. Back to Menu`;
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

        if (stateData.state === 'VUKA_POST_INPUT') {
            const content = parts[parts.length - 1];
            if (content === '0') {
                USSDService.setState(cleanMsisdn, 'IDLE');
                return USSDService.showMainMenu(cleanMsisdn);
            }
            await VukaService.createPost(cleanMsisdn, content);
            USSDService.setState(cleanMsisdn, 'IDLE');
            return `END Post created! Your message is now visible on the social feed.`;
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
        }

        if (stateData.state === 'PAYMENT_OTP') {
            const otp = parts[parts.length - 1];
            const res = await PaymentService.validateOTP(cleanMsisdn, stateData.data.payToken, otp, stateData.data.planType);
            USSDService.setState(cleanMsisdn, 'IDLE');
            if (res.success) return `END SUCCESS: ${res.message}`;
            return `END FAILED: ${res.error}`;
        }

        if (stateData.state === 'CROP_SCAN_DESCRIBE') {
            const description = parts[parts.length - 1];
            if (description === '0') {
                USSDService.setState(cleanMsisdn, 'IDLE');
                return USSDService.showMainMenu(cleanMsisdn);
            }
            
            try {
                const aiResponse = await askGemini(
                    [{ role: 'user', parts: [{ text: `My crop has this problem: ${description}` }] }],
                    "You are mARI, a concise AI agronomist. Provide a quick 1-2 sentence advice under 120 chars."
                );
                USSDService.setState(cleanMsisdn, 'IDLE');
                
                // Also send a link to the web app for deeper diagnosis
                const webUrl = `${WEBAPP_URL}/diagnose`;
                const fullMsisdn = cleanMsisdn.startsWith('+') ? cleanMsisdn : '+' + cleanMsisdn;
                console.log(`[Crop Scan] Sending AI advice & link to ${fullMsisdn}`);
                await sendSMS(fullMsisdn, `mAgri mARI Advice: ${aiResponse}\n\nFor a full scan: ${webUrl}`);
                
                return `CON mARI Advice: ${aiResponse}\n\nDetailed advice & scan link sent via SMS.\n\n0. Back to Menu`;
            } catch (e) {
                console.error('[USSD Crop Scan Error]', e.message);
                USSDService.setState(cleanMsisdn, 'IDLE');
                return `CON Thank you. Your problem has been logged. We will contact you with advice via SMS.\n\n0. Back to Menu`;
            }
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
            
            // 1. Supplies (Sell) or 2. Demands (Buy)
            if (L2 === '1' || L2 === '2') {
                const type = L2 === '1' ? 'sell' : 'buy';
                const listings = await getRecentListings(5, type);
                
                // Details View (Selection)
                if (depth === 3) {
                    const choice = parseInt(L3);
                    if (choice > 0 && choice <= listings.length) {
                        const l = listings[choice - 1];
                        return `CON *${l.crop_name}*\n${type === 'sell' ? 'Seller' : 'Buyer'}: ${l.phone}\nQty: ${l.quantity}\nPrice: ${l.price || 'Negotiable'}\nLoc: ${l.district || l.location || 'Local'}\n\n1. Contact via SMS\n0. Back\n00. Menu`;
                    }
                }

                // Listing List
                let res = `CON *Recent ${type === 'sell' ? 'Supplies' : 'Demands'}*\n`;
                if (listings.length === 0) res += "No active listings found.";
                else listings.forEach((l, i) => { res += `${i+1}. ${l.crop_name || 'Crop'} (${l.price || 'Neg.'})\n`; });
                res += `\n0. Back\n00. Menu`;
                return res;
            }

            // 3. Search
            if (L2 === '3') {
                if (depth === 2) {
                    USSDService.setState(cleanMsisdn, 'MARKETPLACE_INPUT');
                    return `CON ` + T.marketplace_prompt;
                }
            }
        }

        if (L1 === '3') { // Crop Scan
            if (depth === 1) return `CON ` + (T.crop_scan_menu || `*Crop Scan*\n1. Web App Link\n2. WhatsApp Link\n3. Describe Problem\n\n0. Menu`);
            
            if (parts[1] === '1') {
                const webUrl = `${WEBAPP_URL}/diagnose`;
                const fullMsisdn = cleanMsisdn.startsWith('+') ? cleanMsisdn : '+' + cleanMsisdn;
                console.log(`[Crop Scan] Sending Web Link to ${fullMsisdn}`);
                await sendSMS(fullMsisdn, `mAgri: Use this link for Web Crop Scan: ${webUrl}\n\nYou can upload a photo of your crop symptoms here for a detailed AI diagnosis.`);
                return `CON A link to the Web App Crop Scan has been sent via SMS.\n\n0. Back\n00. Main Menu`;
            }
            if (parts[1] === '2') {
                const botPhone = (WHATSAPP_NUMBER).replace(/\+/g, '').replace('whatsapp:', '');
                const waLink = `https://wa.me/${botPhone}?text=Scan`; 
                const fullMsisdn = cleanMsisdn.startsWith('+') ? cleanMsisdn : '+' + cleanMsisdn;
                console.log(`[Crop Scan] Sending WhatsApp Link to ${fullMsisdn}`);
                await sendSMS(fullMsisdn, `mAgri: Use this link for WhatsApp Crop Scan: ${waLink}\n\nSimply send 'Scan' to begin the AI diagnosis on WhatsApp.`);
                return `CON A link to the WhatsApp Crop Scan has been sent to ${fullMsisdn}.\n\n0. Back\n00. Main Menu`;
            }
            if (parts[1] === '3') {
                USSDService.setState(cleanMsisdn, 'CROP_SCAN_DESCRIBE');
                return `CON ` + (T.crop_scan_describe_prompt || `*Describe Problem*\nPlease describe what is wrong with your crop:`) + `\n\n0. Back`;
            }
        }

        if (L1 === '4') { // Ask mARI
            USSDService.setState(cleanMsisdn, 'USSD_AI_ADVISOR');
            return `CON ` + T.agronomist_prompt;
        }

        if (L1 === '5') { // Finance
            if (depth === 1) return `CON ` + T.credit_menu;
            if (parts[1] === '1') return `CON ` + T.credit_score('780') + `\n\n0. Back`;
            return `CON *mARI Finance*\nVisit the web app to manage your applications.\n\n0. Back`;
        }

        if (L1 === '6') { // Weather
            return `CON ` + T.weather_info + `\n\n0. Menu`;
        }

        if (L1 === '7') { // Community
            return `CON ` + T.community_info(WEBAPP_URL) + `\n\n0. Menu`;
        }

        if (L1 === '8') { // Vuka
            if (depth === 1) return `CON ` + T.vuka_menu;
            
            // 1. My Profile
            if (L2 === '1') {
                const user = await VukaService.getUser(cleanMsisdn);
                if (!user) {
                    USSDService.setState(cleanMsisdn, 'VUKA_REGISTER_NAME');
                    return `CON ` + T.vuka_register_prompt + `\n\n0. Back`;
                }

                // Handle profile sub-actions if any
                if (L3 === '2') { // Jump to feed from profile
                    parts = ['8', '2'];
                    return await USSDService.handleRequest(msisdn, parts.join('*'));
                }
                if (L3 === '3') { // Jump to create post
                    parts = ['8', '3'];
                    return await USSDService.handleRequest(msisdn, parts.join('*'));
                }

                const friends = await VukaService.getFriends(cleanMsisdn);
                return `CON ` + T.vuka_profile(user, friends.length) + `\n\n0. Back (Vuka Menu)\n00. Main Menu`;
            }

            // 2. Social Feed
            if (L2 === '2') {
                const posts = await VukaService.getPosts();
                let feed = `CON *Vuka Feed*\n`;
                if (posts.length === 0) feed += "No posts yet. Be the first!";
                else posts.slice(0, 4).forEach(p => { feed += `• ${p.content.substring(0, 35)}...\n`; });
                feed += `\n0. Back`;
                return feed;
            }

            // 3. Create Post
            if (L2 === '3') {
                USSDService.setState(cleanMsisdn, 'VUKA_POST_INPUT');
                return `CON ` + (T.vuka_post_prompt || "Type what's on your mind:") + `\n\n0. Back`;
            }

            // 5. Find Friends
            if (L2 === '5') {
                USSDService.setState(cleanMsisdn, 'VUKA_SEARCH_FRIEND');
                return `CON ` + T.vuka_search_prompt + `\n\n0. Back`;
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
        const T = getLang(profile.language || 'en');

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
