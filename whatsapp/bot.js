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


const WEBAPP_URL = process.env.WEBAPP_URL || 'https://navajowhite-monkey-252201.hostingersite.com';

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
  // Relying on askGemini centralized service for API key management

  try {
    const stream = await downloadContentFromMessage(messageContent, 'image');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }
    
    const mimeType = messageContent.mimetype || 'image/jpeg';
    const base64Data = buffer.toString('base64');
    const country = getCountryFromPhone(phone);
    const dateStr = new Date().toLocaleString();

    const systemPrompt = `Analyze this crop image for diseases. 
      Context: User in ${country}, Time: ${dateStr}. 
      Respond in JSON: {"disease": "...", "confidence": 0-100, "recommendation": "..."}`;

    // Using centralized model config in askGemini
const data = await askGemini([{
      parts: [
        { text: systemPrompt },
        { inline_data: { mime_type: mimeType, data: base64Data } }
      ]
    }]);

    const text = data || '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    const parsed = JSON.parse(jsonMatch[0]);

    // Parity Fix: Store WhatsApp scan in the centralized resources table
    try {
        const { supabase } = await import('../supabaseClient.js');
        const cleanPhone = phone.replace(/\+/g, '').trim();
        await supabase.from('resources').insert([{
            phone: cleanPhone,
            title: parsed.disease || 'WhatsApp Diagnosis',
            type: 'Diagnosis',
            description: parsed.recommendation || 'No recommendation.',
            image: `whatsapp_media_${Date.now()}` // Reference for tracing
        }]);
    } catch (storeErr) {
        console.error('[WhatsApp Bot] Failed to sync scan to resources:', storeErr.message);
    }
    
    return `🔬 *Crop Diagnostic Complete*\n\n` +
           `🌍 *Region:* ${country}\n` +
           `🦠 *Disease:* ${parsed.disease || 'Unknown'}\n` +
           `📊 *Confidence:* ${parsed.confidence || '??'}%\n\n` +
           `🛡 *Recommendation:*\n${parsed.recommendation || 'No recommendation.'}`;
  } catch (error) {
    return '❌ Analysis failed. Ensure the image is clear and try again.';
  }
}

// ─── Image handler ────────────────────────────────────────────────────────────

export async function processImage(phone, messageContent) {
  const session = await getSession(phone);

  if (session.state === 'DIAGNOSE_PENDING') {
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
      const listing = await createListing(phone, publicUrl);
      await updateSession(phone, { state: 'WELCOME' });
      return `✅ *Listing Created!*\n\nView here: ${WEBAPP_URL}/marketplace?listing=${listing.id}\n\nReply *MENU* to return.`;
    } catch (err) {
      await updateSession(phone, { state: 'WELCOME' });
      return `❌ Upload failed. Please try again or type *MENU*.`;
    }
  }

  return `📸 Got your image, but we aren't expecting one. Reply *3* for a Scan or *MENU*.`;
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
    return L.welcome(session.linked);
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
    return L.welcome(session.linked);
  }

  if (session.state === 'WELCOME') {
    if (text === '1') {
        const status = session.linked ? `Linked (${session.email})` : 'Guest Mode';
        return `📦 *Dashboard*\nStatus: ${status}\nActive Orders: 0\nYour Listings: 0\n\nReply *MENU* to return.`;
    }
    if (text === '2') {
      await updateSession(cleanPhone, { state: 'MARKETPLACE' });
      return MENU.MARKETPLACE_LOADING;
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
      return MENU.CREDIT_MENU;
    }
    if (text === '6') {
      return `🌦 *Weather Forecast*\nSunny with light showers. Good for your crops!\n\nReply *MENU* to return.`;
    }
    if (text === '7') {
      return `💬 *Community*\nJoin our 5,000+ member farmer forum here: ${WEBAPP_URL}/community\n\nReply *MENU* to return.`;
    }
    if (text === '8') {
      await updateSession(cleanPhone, { state: 'VUKA' });
      return MENU.VUKA_MENU;
    }
    if (text === '9') {
      await updateSession(cleanPhone, { state: 'SET_LANGUAGE' });
      return L.change_lang;
    }
    if (text === '10') {
      await updateSession(cleanPhone, { state: 'MPOTSA' });
      return MENU.MPOTSA_PROMPT;
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
      return L.welcome(session.linked);
    }
    if (text === '1') {
      const u = await VukaService.getUser(cleanPhone);
      if (!u) return `❌ Profile not found. Create one on USSD first!`;
      return `👤 *My Profile*\nName: ${u.display_name || 'N/A'}\nBio: ${u.bio || 'N/A'}\n\nType *0* to go back.`;
    }
    if (text === '2') {
      const friends = await VukaService.getFriends(cleanPhone);
      return `👥 *Find Friends*\nYou have ${friends.length} friends.\nUse USSD *144# to search for more.\n\nType *0* to go back.`;
    }
    if (text === '3') {
      return `💬 *Groups*\nGroup chat mirror coming soon to WhatsApp!\n\nType *0* to go back.`;
    }
    return `❓ Invalid option. Type *0* to go back.`;
  }

  if (session.state === 'MPOTSA') {
    if (upper === 'CANCEL' || upper === 'MENU' || text === '0') {
      await updateSession(cleanPhone, { state: 'WELCOME' });
      return L.welcome(session.linked);
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
      return L.welcome(session.linked);
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
    return `✅ Language updated!\n\n` + getLang(newLang).welcome(session.linked);
  }

  if (session.state === 'DIAGNOSE_FOLLOWUP') {
    if (upper === '0' || upper === 'MENU') {
      await updateSession(cleanPhone, { state: 'WELCOME', history: [] });
      return L.welcome(session.linked);
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
      return L.welcome(session.linked);
    }
    
    const listings = await getRecentListings(5);
    const resultsStr = listings.length > 0 
        ? listings.map(l => `🌾 *${l.crop_name || 'Crop'}*\nPrice: Negotiable\n seller: ${l.phone}\n [View](${WEBAPP_URL}/marketplace?id=${l.id})`).join('\n\n')
        : "No active listings found for your search.";

    return `🛒 *Marketplace Search*\nResults for "${text}":\n\n${resultsStr}\n\nType *0* to go back.`;
  }

  if (session.state === 'CREDIT') {
    if (text === '0' || upper === 'MENU') {
      await updateSession(cleanPhone, { state: 'WELCOME' });
      return L.welcome(session.linked);
    }
    if (text === '1') return `📊 *Your Credit Score*\nScore: 780 (A+)\nStatus: Eligible for 5,000 credit limit.\n\nType *0* to go back.`;
    if (text === '2') {
      await updateSession(cleanPhone, { state: 'CREDIT_APPLY' });
      return MENU.CREDIT_APPLY_PROMPT;
    }
    return `❓ Invalid option. Type *0* to go back.`;
  }

  if (session.state === 'CREDIT_APPLY') {
    if (upper === 'CANCEL' || upper === 'MENU') {
      await updateSession(phone, { state: 'CREDIT' });
      return MENU.CREDIT_MENU;
    }
    await updateSession(phone, { state: 'WELCOME' });
    return MENU.CREDIT_APPLY_OK(text);
  }

  return L.welcome(session.linked);
}
