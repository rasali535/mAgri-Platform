/**
 * whatsapp/bot.js
 * Core WhatsApp conversational FSM.
 *
 * persona: mARI, the expert AI Agronomist by mARI Platform, developed by Pameltex Tech.
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
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return '❌ AI Diagnosis unavailable (API key missing).';

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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: systemPrompt },
            { inline_data: { mime_type: mimeType, data: base64Data } }
          ]
        }]
      })
    });

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    const parsed = JSON.parse(jsonMatch[0]);
    
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

async function askGemini(phone, question, history = [], lang = 'en') {
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return '❌ AI service unavailable.';

  try {
    const country = getCountryFromPhone(phone);
    const dateStr = new Date().toLocaleString();
    const systemPrompt = `You are mARI, an AI agronomist for Pameltex Tech. 
      Context: Date ${dateStr}, User Country: ${country}. 
      Give localized advice for ${country} farmers. Reply in ${lang}.`;

    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          ...history,
          { role: 'user', parts: [{ text: `Instruction: ${systemPrompt}\nQuestion: ${question}` }] }
        ]
      })
    });
    const data = await resp.json();
    return (data.candidates?.[0]?.content?.parts?.[0]?.text || 'No answer.').trim();
  } catch (e) {
    return '❌ AI error. Please try again later.';
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function processMessage(phone, rawText) {
  const text = (rawText || '').trim();
  const upper = text.toUpperCase();
  const session = await getSession(phone);
  const L = getLang(session.language);

  if (upper === 'MENU' || upper === 'HI' || upper === 'HELLO' || upper === 'START') {
    await updateSession(phone, { state: 'WELCOME' });
    return L.welcome(session.linked);
  }

  // --- Vuka WhatsApp Mirror ---
  const vukaUser = await VukaService.getUser(phone);
  if (vukaUser) {
    if (upper.startsWith('BROADCAST')) {
      const msg = text.substring(9).trim();
      const friends = await VukaService.getFriends(phone);
      for (const friend of friends) {
        // In a real app we'd send to their WhatsApp if they have it, or SMS
        // For now, let's relay to WhatsApp to simulate social action
        VukaService.relayToWhatsApp(phone, friend.friend_msisdn, `[BROADCAST] ${msg}`).catch(()=>{});
      }
      return `📢 Broadcast sent to ${friends.length} friends!`;
    }
    if (upper === 'FRIENDS') {
      const friends = await VukaService.getFriends(phone);
      if (friends.length === 0) return `👥 You have no Vuka friends yet. Add them on USSD!`;
      return `👥 *Your Vuka Friends:*\n` + friends.map(f => `• ${f.friend_msisdn}`).join('\n');
    }
  }

  if (upper === 'LINK') {
    await updateSession(phone, { state: 'AWAIT_LINK' });
    return L.await_link;
  }

  if (upper === 'CANCEL') {
    await updateSession(phone, { state: 'WELCOME' });
    return L.welcome(session.linked);
  }

  if (session.state === 'WELCOME') {
    if (text === '1') return `📦 *Dashboard*\nYou have 0 active orders and 0 listings.\n\nReply *MENU* to return.`;
    if (text === '2') {
      await updateSession(phone, { state: 'MARKETPLACE' });
      return MENU.MARKETPLACE_LOADING;
    }
    if (text === '3') {
      await updateSession(phone, { state: 'DIAGNOSE_PENDING' });
      return L.diagnose_prompt;
    }
    if (text === '4') {
      await updateSession(phone, { state: 'AGRONOMIST' });
      return L.agronomist_prompt;
    }
    if (text === '5') {
      await updateSession(phone, { state: 'CREDIT' });
      return MENU.CREDIT_MENU;
    }
    if (text === '6') {
      return `🌦 *Weather Forecast*\nSunny with light showers. Good for your crops!\n\nReply *MENU* to return.`;
    }
    if (text === '7') {
      return `💬 *Community*\nJoin our 5,000+ member farmer forum here: ${WEBAPP_URL}/community\n\nReply *MENU* to return.`;
    }
    if (text === '8') {
      await updateSession(phone, { state: 'VUKA' });
      return MENU.VUKA_MENU;
    }
    if (text === '9') {
      await updateSession(phone, { state: 'SET_LANGUAGE' });
      return L.change_lang;
    }
    if (text === '10') {
      await updateSession(phone, { state: 'MPOTSA' });
      return MENU.MPOTSA_PROMPT;
    }
    return L.unknown;
  }

  if (session.state === 'AWAIT_LINK') {
    if (isValidEmail(text)) {
      await updateSession(phone, { state: 'WELCOME', linked: true, email: text });
      return MENU.LINKED_OK(text);
    }
    return `❌ Invalid email. Type *CANCEL* to go back.`;
  }

  if (session.state === 'VUKA') {
    if (text === '0' || upper === 'MENU') {
      await updateSession(phone, { state: 'WELCOME' });
      return L.welcome(session.linked);
    }
    if (text === '1') {
      const u = await VukaService.getUser(phone);
      if (!u) return `❌ Profile not found. Create one on USSD first!`;
      return `👤 *My Profile*\nName: ${u.display_name || 'N/A'}\nBio: ${u.bio || 'N/A'}\n\nType *0* to go back.`;
    }
    if (text === '2') {
      const friends = await VukaService.getFriends(phone);
      return `👥 *Find Friends*\nYou have ${friends.length} friends.\nUse USSD *144# to search for more.\n\nType *0* to go back.`;
    }
    if (text === '3') {
      return `💬 *Groups*\nGroup chat mirror coming soon to WhatsApp!\n\nType *0* to go back.`;
    }
    return `❓ Invalid option. Type *0* to go back.`;
  }

  if (session.state === 'MPOTSA') {
    if (upper === 'CANCEL' || upper === 'MENU' || text === '0') {
      await updateSession(phone, { state: 'WELCOME' });
      return L.welcome(session.linked);
    }
    // Search Q&A
    const result = await MpotsaService.search(text, phone);
    if (result.type === 'NONE') {
      return `🔍 ${result.text}\n\nType another keyword or *0* to exit.`;
    }
    
    return `📚 *Answer:*\n${result.text}\n\nType another keyword or *0* to exit.`;
  }

  if (session.state === 'AGRONOMIST') {
    if (upper === '0' || upper === 'MENU') {
      await updateSession(phone, { state: 'WELCOME' });
      return L.welcome(session.linked);
    }
    sendWhatsApp(phone, "⏳ Consulting mARI Advisor...").catch(()=>{});
    const answer = await askGemini(phone, text, session.history, session.language);
    const newHistory = [...(session.history || []), { role: 'user', parts: [{ text }] }, { role: 'model', parts: [{ text: answer }] }];
    await updateSession(phone, { history: newHistory.slice(-10) });
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

    await updateSession(phone, { state: 'WELCOME', language: newLang });
    return `✅ Language updated!\n\n` + getLang(newLang).welcome(session.linked);
  }

  if (session.state === 'DIAGNOSE_FOLLOWUP') {
    if (upper === '0' || upper === 'MENU') {
      await updateSession(phone, { state: 'WELCOME', history: [] });
      return L.welcome(session.linked);
    }
    sendWhatsApp(phone, "⏳ Thinking...").catch(()=>{});
    const answer = await askGemini(phone, text, session.history, session.language);
    const newHistory = [...(session.history || []), { role: 'user', parts: [{ text }] }, { role: 'model', parts: [{ text: answer }] }];
    await updateSession(phone, { history: newHistory.slice(-10) });
    return `🔬 *Diagnostic Follow-up:*\n\n${answer}\n\nType *MENU* to exit.`;
  }

  if (session.state === 'MARKETPLACE') {
    if (text === '0' || upper === 'MENU') {
      await updateSession(phone, { state: 'WELCOME' });
      return L.welcome(session.linked);
    }
    return `🛒 *Marketplace Search*\nShowing results for "${text}":\n\nNo listings found in your area yet.\n\nType *0* to go back.`;
  }

  if (session.state === 'CREDIT') {
    if (text === '0' || upper === 'MENU') {
      await updateSession(phone, { state: 'WELCOME' });
      return L.welcome(session.linked);
    }
    if (text === '1') return `📊 *Your Credit Score*\nScore: 780 (A+)\nStatus: Eligible for 5,000 credit limit.\n\nType *0* to go back.`;
    if (text === '2') {
      await updateSession(phone, { state: 'CREDIT_APPLY' });
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
