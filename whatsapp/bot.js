/**
 * whatsapp/bot.js
 * Core WhatsApp conversational FSM.
 *
 * persona: mARI, the expert AI Agronomist for the mARI Platform by Pameltex Tech.
 */

import { getSession, updateSession, resetSession } from './supabaseStore.js';
import { MENU } from './menu.js';
import { getLang } from './translations.js';
import { uploadMediaToSupabase } from './imageUploader.js';
import { createListing } from './listingsStore.js';
import { sendWhatsApp } from './africa.js';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { VukaService } from '../services/vuka.js';
import { MpotsaService } from '../services/mpotsa.js';
import { askGemini } from '../services/ai.js';
import { getRecentListings } from './listingsStore.js';
import { getSupabaseClient } from '../src/lib/supabaseClient.js';
import { PaymentService } from '../services/payment.js';
import db from '../services/database.js';
import { DashboardService } from '../services/dashboard.js';


const WEBAPP_URL = process.env.WEBAPP_URL || 'https://orangered-clam-470152.hostingersite.com';

// ─── Locale Helpers ──────────────────────────────────────────────────────────

function getCountryFromPhone(phone) {
  if (phone.startsWith('+267')) return 'Botswana';
  if (phone.startsWith('+260')) return 'Zambia';
  if (phone.startsWith('+254')) return 'Kenya';
  if (phone.startsWith('+225')) return "Côte d'Ivoire";
  if (phone.startsWith('+234')) return 'Nigeria';
  return 'Africa';
}

function isValidEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

// ─── Gemini Image Diagnostics ─────────────────────────────────────────────────

async function generateCropDiagnosis(phone, messageContent) {
  const cleanPhone = phone.replace(/\+/g, '').trim();
  console.log(`[WA AI] Starting diagnosis for ${cleanPhone}`);

  try {
    // Robust image download
    let buffer;
    try {
        const stream = await downloadContentFromMessage(messageContent, 'image');
        let chunks = [];
        for await (const chunk of stream) { chunks.push(chunk); }
        buffer = Buffer.concat(chunks);
    } catch (downloadErr) {
        console.error('[WA AI] Download failed:', downloadErr.message);
        throw new Error('DOWNLOAD_FAILED');
    }
    
    if (!buffer || buffer.length === 0) throw new Error('EMPTY_IMAGE_BUFFER');
    console.log(`[WA AI] Downloaded image: ${buffer.length} bytes`);

    const mimeType = messageContent.mimetype || 'image/jpeg';
    const base64Data = buffer.toString('base64');
    const country = getCountryFromPhone(phone);
    const dateStr = new Date().toLocaleString();

    const systemInstruction = `You are mARI, an expert AI agronomist for the mARI Platform. 
      Analyze the provided crop image from a farmer in ${country}. 
      Current Date: ${dateStr}.
      
      You must diagnose the plant health:
      1. Identify the crop and any disease/pest present.
      2. Provide a confidence level (0-100).
      3. Provide concise, organic or chemical treatment advice localized for ${country}.
      
      IMPORTANT: You must respond ONLY with a JSON object.
      Schema: {"disease": "Crop Name - Disease/Pest Name", "confidence": number, "recommendation": "Advice string"}`;

    const userPrompt = "Analyze this crop image for diseases and pests. Provide results in the required JSON format.";

    console.log(`[WA AI] Requesting Gemini analysis...`);
    const data = await askGemini(
      [{
        role: 'user',
        parts: [
          { text: userPrompt },
          { inline_data: { mime_type: mimeType, data: base64Data } }
        ]
      }],
      systemInstruction,
      { gracefulFallback: true }
    );

    const text = (data || '{}').trim();
    console.log(`[WA AI] Raw response from Gemini:`, text);

    // More robust JSON extraction
    let parsed;
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('NO_JSON');
        parsed = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
        console.warn('[WA AI] JSON Parse failed, attempting fallback...');
        parsed = { disease: 'Disease detected', confidence: 75, recommendation: text.substring(0, 500) };
    }

    // Sync to resources table
    try {
        const supabase = getSupabaseClient();
        await supabase.from('resources').insert([{
            phone: cleanPhone,
            title: parsed.disease || 'WhatsApp Diagnosis',
            type: 'Diagnosis',
            description: parsed.recommendation || 'No recommendation.',
            image: `wa_${Date.now()}` 
        }]);
    } catch (storeErr) {
        console.error('[WA AI] Sync failed:', storeErr.message);
    }
    
    return `🔬 *Crop Diagnostic Result*\n\n` +
           `🌍 *Region:* ${country}\n` +
           `🦠 *Disease:* ${parsed.disease || 'Unknown'}\n` +
           `📊 *Confidence:* ${parsed.confidence || '??'}%\n\n` +
           `🛡 *Advice:*\n${parsed.recommendation || 'No recommendation.'}`;
  } catch (error) {
    console.error('[WA AI] Diagnostic CRITICAL error:', error.message || error);
    if (error.message === 'DOWNLOAD_FAILED') return '❌ Failed to process image file. Please try sending it again as a direct photo.';
    if (error.message === 'EMPTY_IMAGE_BUFFER') return '❌ Received empty image. Please resend.';
    return '❌ mARI is having trouble seeing that image clearly. Please try a different angle or lighting.';
  }
}

// ─── Image handler ────────────────────────────────────────────────────────────

export async function processImage(phone, messageContent) {
  const cleanPhone = (phone || '').toString().replace(/\+/g, '').trim();
  const session = await getSession(cleanPhone);

  if (session.state === 'DIAGNOSE_PENDING' || session.state === 'WELCOME' || session.state === 'DIAGNOSE_FOLLOWUP' || session.state === 'AGRONOMIST') {
    sendWhatsApp(phone, "⏳ Analyzing your crop image... Please hold.").catch(() => {});
    const resultText = await generateCropDiagnosis(phone, messageContent);
    const finalReply = `${resultText}\n\n🕵️ *Questions?*\nAsk mARI for more details below, or type *MENU* to exit.`;
    
    await updateSession(phone, { 
      state: 'DIAGNOSE_FOLLOWUP',
      history: [
        { role: 'user', parts: [{ text: 'Please analyze this crop image.' }] },
        { role: 'model', parts: [{ text: resultText }] }
      ]
    });
    return finalReply;
  }

  if (session.state === 'UPLOAD_PENDING') {
    try {
      const publicUrl = await uploadMediaToSupabase(messageContent, phone);
      const listing = await createListing({ phone, imageUrl: publicUrl, type: 'sell' });
      await updateSession(phone, { state: 'WELCOME' });
      return `✅ *Listing Created!*\n\nView here: ${WEBAPP_URL}/marketplace?listing=${listing.id}\n\nReply *MENU* to return.`;
    } catch (err) {
      await updateSession(phone, { state: 'WELCOME' });
      return `❌ Upload failed. Please try again or type *MENU*.`;
    }
  }

  // Default for images: If they send an image in any other state, just treat it as a crop scan
  sendWhatsApp(phone, "⏳ Got your image! mARI is scanning it for you now...").catch(() => {});
  const diagResult = await generateCropDiagnosis(phone, messageContent);
  await updateSession(phone, { state: 'DIAGNOSE_FOLLOWUP' });
  return `${diagResult}\n\n🕵️ *Questions?*\nYou can ask mARI follows-up questions about this result below, or type *MENU* to return.`;
}

// AI logic is now centralized in services/ai.js

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function processMessage(phone, rawText) {
  const cleanPhone = (phone || '').toString().replace(/\+/g, '').trim();
  const text = (rawText || '').trim();
  const upper = text.toUpperCase();
  const session = await getSession(cleanPhone);
  const L = getLang(session.language);

  if (upper === 'MENU' || upper === 'HI' || upper === 'HELLO' || upper === 'START') {
    await updateSession(cleanPhone, { state: 'WELCOME' });
    const vukaData = await VukaService.getUser(cleanPhone);
    const greetingName = vukaData?.name || (session.email ? session.email.split('@')[0] : null);
    return L.welcome(session.linked, greetingName);
  }

  // --- Vuka WhatsApp Mirror ---
  const vukaUser = await VukaService.getUser(cleanPhone);
  if (vukaUser) {
    if (upper.startsWith('BROADCAST')) {
      const msg = text.substring(9).trim();
      const friends = await VukaService.getFriends(cleanPhone);
      for (const friend of friends) {
        // In a real app we'd send to their WhatsApp if they have it, or SMS
        // For now, let's relay to WhatsApp to simulate social action
        VukaService.relayToWhatsApp(cleanPhone, friend.friend_msisdn, `[BROADCAST] ${msg}`).catch(()=>{});
      }
      return `📢 Broadcast sent to ${friends.length} friends!`;
    }
    if (upper === 'FRIENDS') {
      const friends = await VukaService.getFriends(cleanPhone);
      if (friends.length === 0) return `👥 You have no Vuka friends yet. Add them on USSD!`;
      return `👥 *Your Vuka Friends:*\n` + friends.map(f => `• ${f.friend_msisdn}`).join('\n');
    }
  }

  if (upper === 'LINK') {
    await updateSession(cleanPhone, { state: 'AWAIT_LINK' });
    return L.await_link;
  }

  if (upper === 'CANCEL') {
    await updateSession(cleanPhone, { state: 'WELCOME' });
    const vukaData = await VukaService.getUser(cleanPhone);
    const greetingName = vukaData?.name || (session.email ? session.email.split('@')[0] : null);
    return L.welcome(session.linked, greetingName);
  }

  if (session.state === 'WELCOME') {
    if (text === '1') {
        const data = await DashboardService.getData(cleanPhone);
        return L.dashboard(data.profile, data.subscription, data.stats) + `\n\nReply *MENU* to return.`;
    }
    if (text === '2') {
      await updateSession(cleanPhone, { state: 'MARKETPLACE' });
      return L.marketplace_menu;
    }
    if (text === '3') {
      await updateSession(cleanPhone, { state: 'DIAGNOSE_PENDING' });
      return L.diagnose_prompt;
    }
    if (text === '4') {
      await updateSession(cleanPhone, { state: 'AGRONOMIST' });
      return L.agronomist_prompt;
    }
    if (text === '5') {
      await updateSession(cleanPhone, { state: 'CREDIT' });
      return L.credit_menu;
    }
    if (text === '6') {
      return L.weather_info + `\n\n` + L.back_menu;
    }
    if (text === '7') {
      return L.community_info(WEBAPP_URL) + `\n\n` + L.back_menu;
    }
    if (text === '8') {
      await updateSession(cleanPhone, { state: 'VUKA' });
      return L.vuka_menu;
    }
    if (text === '9') {
      await updateSession(cleanPhone, { state: 'SET_LANGUAGE' });
      return L.change_lang;
    }
    if (text === '10') {
      await updateSession(cleanPhone, { state: 'MPOTSA' });
      return L.mpotsa_prompt;
    }
    if (text === '11') {
        return L.subscription_info + `\n\n` + L.back_menu;
    }
    return L.unknown;
  }

  if (session.state === 'AWAIT_LINK') {
    if (isValidEmail(text)) {
      await updateSession(cleanPhone, { state: 'WELCOME', linked: true, email: text });
      return MENU.LINKED_OK(text);
    }
    return `❌ Invalid email. Type *CANCEL* to go back.`;
  }

  if (session.state === 'VUKA') {
    if (text === '0' || upper === 'MENU') {
      await updateSession(cleanPhone, { state: 'WELCOME' });
      const vukaData = await VukaService.getUser(cleanPhone);
      const greetingName = vukaData?.name || (session.email ? session.email.split('@')[0] : null);
      return L.welcome(session.linked, greetingName);
    }
    
    // 1. My Profile
    if (text === '1') {
      const u = await VukaService.getUser(cleanPhone);
      if (!u) {
        await updateSession(cleanPhone, { state: 'VUKA_REGISTER_NAME' });
        return L.vuka_register_prompt;
      }
      const friends = await VukaService.getFriends(cleanPhone);
      return L.vuka_profile(u, friends.length);
    }

    // 2. Social Feed
    if (text === '2') {
      const posts = await VukaService.getPosts();
      if (posts.length === 0) return `📬 *Vuka Feed*\nNo posts yet. Be the first to share!\n\nReply *3* to post or *0* to go back.`;
      
      let feed = `📬 *Vuka Social Feed*\n\n`;
      posts.slice(0, 5).forEach((p, i) => {
        const author = p.author?.name || p.author_msisdn;
        feed += `${i+1}. *${author}*: ${p.content}\n_(${new Date(p.created_at).toLocaleDateString()})_\n\n`;
      });
      return feed + `Reply *3* to post or *0* to go back.`;
    }

    // 3. Create Post
    if (text === '3') {
      const u = await VukaService.getUser(cleanPhone);
      if (!u) {
        await updateSession(cleanPhone, { state: 'VUKA_REGISTER_NAME' });
        return `❌ You need a profile to post.\n\n` + L.vuka_register_prompt;
      }
      await updateSession(cleanPhone, { state: 'VUKA_CREATE_POST' });
      return L.vuka_post_prompt;
    }

    // 5. Find Friends
    if (text === '5') {
        await updateSession(cleanPhone, { state: 'VUKA_SEARCH' });
        return L.vuka_search_prompt;
    }

    return MENU.VUKA_MENU;
  }

  if (session.state === 'VUKA_SEARCH') {
    if (upper === 'CANCEL' || text === '0') {
      await updateSession(cleanPhone, { state: 'VUKA' });
      return MENU.VUKA_MENU;
    }
    const users = await VukaService.searchUsers(text);
    if (users.length === 0) return `❌ No users found for "${text}".\n\nTry another name or type *CANCEL*:`;
    
    let res = `👥 *Search Results for "${text}":*\n\n`;
    users.forEach((u, i) => { res += `${i+1}. *${u.name}* (${u.msisdn})\n`; });
    res += `\n*Reply with a number* to add them as a friend, or type *CANCEL*.`;
    await updateSession(cleanPhone, { state: 'VUKA_SEARCH_SELECT', searchResults: users });
    return res;
  }

  if (session.state === 'VUKA_SEARCH_SELECT') {
    const choice = parseInt(text);
    const users = session.searchResults || [];
    if (choice > 0 && choice <= users.length) {
        const friend = users[choice - 1];
        await VukaService.addFriend(cleanPhone, friend.msisdn);
        await updateSession(cleanPhone, { state: 'VUKA' });
        return `✅ Friend request sent to *${friend.name}*!\n\n${L.vuka_menu}`;
    }
    await updateSession(cleanPhone, { state: 'VUKA' });
    return L.vuka_menu;
  }

  if (session.state === 'VUKA_REGISTER_NAME') {
    if (upper === 'CANCEL' || text === '0') {
      await updateSession(cleanPhone, { state: 'VUKA' });
      return MENU.VUKA_MENU;
    }
    const success = await VukaService.registerUser(cleanPhone, text);
    await updateSession(cleanPhone, { state: 'VUKA' });
    if (success) return `✅ Profile created, *${text}*! Welcome to Vuka Social.\n\n1. My Profile\n2. Social Feed\n0. Back`;
    return `❌ Failed to create profile. Try again or type *MENU*.`;
  }

  if (session.state === 'VUKA_CREATE_POST') {
    if (upper === 'CANCEL' || text === '0') {
      await updateSession(cleanPhone, { state: 'VUKA' });
      return MENU.VUKA_MENU;
    }
    try {
      await VukaService.createPost(cleanPhone, text);
      await updateSession(cleanPhone, { state: 'VUKA' });
      return `✅ Post shared to Vuka Feed!\n\n1. My Profile\n2. Social Feed\n0. Back`;
    } catch (e) {
      return `❌ Failed to share post. Try again or type *CANCEL*.`;
    }
  }
  if (session.state === 'CREDIT') {
    if (text === '0' || upper === 'MENU' || upper === 'CANCEL') {
      await updateSession(cleanPhone, { state: 'WELCOME' });
      const vukaData = await VukaService.getUser(cleanPhone);
      const greetingName = vukaData?.name || (session.email ? session.email.split('@')[0] : null);
      return L.welcome(session.linked, greetingName);
    }
    if (text === '1') {
      return L.credit_score('850');
    }
    if (text === '2') {
      await updateSession(cleanPhone, { state: 'CREDIT_APPLY' });
      return MENU.CREDIT_APPLY_PROMPT;
    }
    return `❓ Invalid option. Type *0* to go back.`;
  }

  if (session.state === 'CREDIT_APPLY') {
    if (upper === 'CANCEL' || upper === 'MENU') {
      await updateSession(cleanPhone, { state: 'WELCOME' });
      const vukaData = await VukaService.getUser(cleanPhone);
      const greetingName = vukaData?.name || (session.email ? session.email.split('@')[0] : null);
      return L.welcome(session.linked, greetingName);
    }
    // Simulate processing
    await updateSession(cleanPhone, { state: 'WELCOME' });
    return L.credit_apply_ok(text) + `\n\n` + L.back_menu;
  }

  if (session.state === 'MPOTSA') {
    if (upper === 'CANCEL' || upper === 'MENU' || text === '0') {
      await updateSession(cleanPhone, { state: 'WELCOME' });
      const vukaData = await VukaService.getUser(cleanPhone);
      const greetingName = vukaData?.name || (session.email ? session.email.split('@')[0] : null);
      return L.welcome(session.linked, greetingName);
    }
    // Search Q&A
    const result = await MpotsaService.search(text, cleanPhone);
    if (result.type === 'NONE') {
      return `🔍 ${result.text}\n\nType another keyword or *0* to exit.`;
    }
    
    return `📚 *Answer (Expert):*\n${result.fullText}\n\nType another keyword or *0* to exit.`;
  }

  if (session.state === 'AGRONOMIST') {
    if (upper === '0' || upper === 'MENU') {
      await updateSession(cleanPhone, { state: 'WELCOME' });
      const vukaData = await VukaService.getUser(cleanPhone);
      const greetingName = vukaData?.name || (session.email ? session.email.split('@')[0] : null);
      return L.welcome(session.linked, greetingName);
    }
    sendWhatsApp(cleanPhone, "⏳ Consulting mARI Advisor...").catch(()=>{});
    const country = getCountryFromPhone(cleanPhone);
    const dateStr = new Date().toLocaleString();
    const systemInstruction = `You are mARI, an AI agronomist for mARI Platform by Pameltex Tech. Context: Date ${dateStr}, User Country: ${country}. Give localized advice for ${country} farmers. Reply in ${session.language}.`;
    
    const contents = [
      ...(session.history || []).map(h => ({
        role: h.role,
        parts: h.parts ? h.parts : [{ text: h.text }]
      })),
      { role: 'user', parts: [{ text }] }
    ];

    const answer = await askGemini(contents, systemInstruction);
    const newHistory = [...(session.history || []), { role: 'user', parts: [{ text }] }, { role: 'model', parts: [{ text: answer }] }];
    await updateSession(cleanPhone, { history: newHistory.slice(-10) });
    return `🧑‍🌾 *mARI Agronomist:*\n\n${answer}\n\nType *MENU* to exit.`;
  }

  if (session.state === 'SET_LANGUAGE') {
    let newLang = 'en';
    if (text === '1') newLang = 'en';
    else if (text === '2') newLang = 'tn';
    else if (text === '3') newLang = 'fr';
    else if (text === '4') newLang = 'ny';
    else if (text === '5') newLang = 'be';
    else return L.change_lang;

    await updateSession(cleanPhone, { state: 'WELCOME', language: newLang });
    try {
      db.prepare('UPDATE users SET language = ? WHERE msisdn = ?').run(newLang, cleanPhone);
    } catch (e) {
      console.warn('Could not update user language:', e.message);
    }
    const vukaData = await VukaService.getUser(cleanPhone);
    const greetingName = vukaData?.name || (session.email ? session.email.split('@')[0] : null);
    return `✅ Language updated!\n\n` + getLang(newLang).welcome(session.linked, greetingName);
  }

  if (session.state === 'DIAGNOSE_FOLLOWUP') {
    if (upper === '0' || upper === 'MENU') {
      await updateSession(cleanPhone, { state: 'WELCOME', history: [] });
      const vukaData = await VukaService.getUser(cleanPhone);
      const greetingName = vukaData?.name || (session.email ? session.email.split('@')[0] : null);
      return L.welcome(session.linked, greetingName);
    }
    sendWhatsApp(cleanPhone, "⏳ Thinking...").catch(()=>{});
    const country = getCountryFromPhone(cleanPhone);
    const dateStr = new Date().toLocaleString();
    const systemInstruction = `You are mARI, an expert AI agronomist. User is following up on a crop diagnosis in ${country}. Current time: ${dateStr}. Reply in ${session.language}.`;

    const contents = [
      ...(session.history || []).map(h => ({
        role: h.role,
        parts: h.parts ? h.parts : [{ text: h.text }]
      })),
      { role: 'user', parts: [{ text }] }
    ];

    const answer = await askGemini(contents, systemInstruction);
    const newHistory = [...(session.history || []), { role: 'user', parts: [{ text }] }, { role: 'model', parts: [{ text: answer }] }];
    await updateSession(cleanPhone, { history: newHistory.slice(-10) });
    return `🔬 *Diagnostic Follow-up:*\n\n${answer}\n\nType *MENU* to exit.`;
  }

  if (session.state === 'MARKETPLACE') {
    if (text === '0' || upper === 'MENU') {
      await updateSession(cleanPhone, { state: 'WELCOME' });
      const vukaData = await VukaService.getUser(cleanPhone);
      const greetingName = vukaData?.name || (session.email ? session.email.split('@')[0] : null);
      return L.welcome(session.linked, greetingName);
    }
    
    // 1. Supplies or 2. Demands
    if (text === '1' || text === '2') {
      const type = text === '1' ? 'sell' : 'buy';
      const listings = await getRecentListings(10, type);
      
      if (listings.length === 0) {
        return `🛒 *Marketplace*\nNo ${type === 'sell' ? 'supplies' : 'demands'} found in your area yet.\n\nReply with *MENU* to return.`;
      }

      let res = `🛒 *Marketplace: ${type === 'sell' ? 'Supplies' : 'Demands'}*\n\n`;
      listings.forEach((l, i) => {
        const price = l.price ? `${l.price} (USD)` : 'Negotiable';
        res += `${i + 1}️⃣ *${l.crop_name}*\n📦 Qty: ${l.quantity}\n💰 Price: ${price}\n📍 Loc: ${l.district || l.location || 'Local'}\n👤: ${l.phone}\n🔗 [View Details](${WEBAPP_URL}/marketplace?id=${l.id})\n\n`;
      });
      res += `Reply with *MENU* to return.`;
      return res;
    }

    // 3. Search
    if (text === '3') {
      await updateSession(cleanPhone, { state: 'MARKETPLACE_SEARCH' });
      return L.marketplace_prompt;
    }

    return L.marketplace_menu;
  }

  if (session.state === 'MARKETPLACE_SEARCH') {
    if (text === '0' || upper === 'MENU' || upper === 'CANCEL') {
      await updateSession(cleanPhone, { state: 'MARKETPLACE' });
      return L.marketplace_menu;
    }

    const listings = await searchListings(text, 5);
    if (listings.length === 0) return L.marketplace_no_results + "\n\nTry another crop or type *0* to go back.";

    let res = `🔎 *Search Results: ${text}*\n\n`;
    listings.forEach((l, i) => {
      const typeLabel = l.type === 'buy' ? '📍 BUY' : '🛒 SELL';
      res += `${i + 1}️⃣ ${typeLabel}: *${l.crop_name}*\nQty: ${l.quantity}\nPrice: ${l.price || 'Neg.'}\nLoc: ${l.district || 'All'}\n\n`;
    });
    res += `Reply *MENU* to return.`;
    return res;
  }

  if (session.state === 'DIAGNOSE_PENDING') {
    if (upper === 'MENU' || upper === '0' || upper === 'CANCEL') {
      await updateSession(cleanPhone, { state: 'WELCOME' });
      const vukaData = await VukaService.getUser(cleanPhone);
      const greetingName = vukaData?.name || (session.email ? session.email.split('@')[0] : null);
      return L.welcome(session.linked, greetingName);
    }
    return `📸 *Step 2/2: Send the photo*\nPlease send the crop photo now, or type *MENU* to cancel.`;
  }

  // Default Case: Use AI (Mpotsa/mARI hybrid) to answer general questions
  if (text.length > 3) {
      sendWhatsApp(cleanPhone, "⏳ Thinking...").catch(()=>{});
      const country = getCountryFromPhone(cleanPhone);
      const dateStr = new Date().toLocaleString();
      const systemInstruction = `You are mARI, the universal AI advisor for mAgri Platform by Pameltex Tech. 
      Current Date: ${dateStr}, User Country: ${country}. 
      You handle general farming questions, health, laws, and common African trivia. 
      Keep answers helpful and localized. If the user seems lost, remind them to type MENU.`;
      
      const contents = [
          ...(session.history || []).map(h => ({ role: h.role, parts: h.parts ? h.parts : [{ text: h.text }] })),
          { role: 'user', parts: [{ text }] }
      ];
      
      const answer = await askGemini(contents, systemInstruction);
      const newHistory = [...(session.history || []), { role: 'user', parts: [{ text }] }, { role: 'model', parts: [{ text: answer }] }];
      await updateSession(cleanPhone, { history: newHistory.slice(-10) });
      
      return `🧑‍🌾 *mARI AI:* ${answer}\n\nType *MENU* for options.`;
  }

  return L.welcome(session.linked);
}
