/**
 * whatsapp/bot.js
 * Core WhatsApp conversational FSM.
 *
 * processMessage(phone, incomingText) → string (reply to send back)
 * processImage(phone, mediaId)        → string (reply after image upload)
 *
 * Sessions are now backed by Supabase (supabaseStore.js).
 */

import { getSession, updateSession, resetSession } from './supabaseStore.js';
import { MENU } from './menu.js';
import { getLang } from './translations.js';
import { uploadMediaToSupabase } from './imageUploader.js';
import { createListing } from './listingsStore.js';
import { sendWhatsApp } from './africa.js';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

const WEBAPP_URL = process.env.WEBAPP_URL || 'https://navajowhite-monkey-252201.hostingersite.com';

// ─── Marketplace mock data (replace with live Supabase queries if preferred) ──
const MOCK_LISTINGS = [
  { type: 'buy',  produce: 'Maize',       qty: '5 Tons',   price: 'Negotiable', location: 'Lusaka, ZM',   user: 'AgriCorp' },
  { type: 'sell', produce: 'Cocoa Beans', qty: '200 kg',   price: '$60/kg',     location: 'Abidjan, CI',  user: 'Kouame'   },
  { type: 'buy',  produce: 'Cashew Nuts', qty: '1 Ton',    price: 'Negotiable', location: 'Bouaké, CI',   user: 'Export Co.' },
  { type: 'sell', produce: 'Tomatoes',    qty: '50 kg',    price: '$0.30/kg',   location: 'Ndola, ZM',    user: 'Grace'    },
  { type: 'sell', produce: 'Onions',      qty: '500 kg',   price: '$0.12/kg',   location: 'Livingstone',  user: 'Banda'    },
  { type: 'buy',  produce: 'Soybeans',    qty: '10 Tons',  price: 'Negotiable', location: 'Kitwe, ZM',    user: 'Global Feed' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatListings(listings) {
  if (!listings.length) return '🔍 No listings found for that search.';
  return (
    listings
      .slice(0, 5)
      .map(
        (l, i) =>
          `${i + 1}. *${l.produce}* (${l.type === 'buy' ? '🛒 Wanted' : '🌾 For Sale'})\n` +
          `   Qty: ${l.qty} | ${l.price}\n` +
          `   📍 ${l.location} — ${l.user}`
      )
      .join('\n\n') +
    '\n\nReply with a crop name to search again, *ALL* for all, or *0* to go back.'
  );
}

function isValidEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

// ─── Gemini Image Diagnostics ─────────────────────────────────────────────────

async function generateCropDiagnosis(messageContent) {
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return '❌ Error: Diagnosis AI unavailable (API key missing).';

  try {
    // 1. Download stream into buffer
    const stream = await downloadContentFromMessage(messageContent, 'image');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    
    // 2. Convert to Base64
    const mimeType = messageContent.mimetype || 'image/jpeg';
    const base64Data = buffer.toString('base64');

    // 3. Prompt Gemini AI
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: 'You are mARI, an expert agronomist AI. Analyze the crop image for diseases. Respond in valid JSON exactly: {"disease": "...", "confidence": 0-100, "recommendation": "..."}' },
            { inline_data: { mime_type: mimeType, data: base64Data } }
          ]
        }]
      })
    });

    if (!response.ok) throw new Error(`Fetch failed with status ${response.status}`);
    const data = await response.json();
    
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    // Clean markdown if present
    text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').replace(/^```\n?/, '').trim();
    const parsed = JSON.parse(text);
    
    return `🔬 *Crop Diagnostic Complete*\n\n` +
           `🦠 *Disease:* ${parsed.disease}\n` +
           `📊 *Confidence:* ${parsed.confidence}%\n\n` +
           `🛡 *Recommendation:*\n${parsed.recommendation}`;
  } catch (error) {
    console.error('[Gemini Diagnosis API Error]', error);
    return '❌ Failed to analyze the image. Please try again later or contact support.';
  }
}

// ─── Image handler (called when Meta sends an image message) ──────────────────

/**
 * Process an incoming WhatsApp IMAGE message.
 * If the session is UPLOAD_PENDING, upload to Supabase and create a listing.
 *
 * @param {string} phone   – E.164 phone number
 * @param {object} messageContent – Baileys imageMessage object
 * @returns {Promise<string>} reply text
 */
export async function processImage(phone, messageContent) {
  const session = await getSession(phone);

  if (session.state === 'DIAGNOSE_PENDING') {
    // Acknowledge receipt immediately via side-channel
    sendWhatsApp(phone, "⏳ Analyzing your crop image... Please hold.").catch(() => {});
    
    // Process image through Gemini
    const resultText = await generateCropDiagnosis(messageContent);
    
    // Final prompt
    const finalReply = `${resultText}\n\n🕵️ *Have follow-up questions?*\nYou can ask me more about this diagnosis right here, or type *MENU* to exit.`;
    
    // Transition to followup state and store diagnosis in history for context
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
      // 1. Upload to Supabase Storage
      const publicUrl = await uploadMediaToSupabase(messageContent, phone);
      // 2. Save listing row
      const listing = await createListing(phone, publicUrl);
      // 3. Reset
      await updateSession(phone, { state: 'WELCOME' });

      return (
        `✅ *Listing Created!*\n\n` +
        `Your crop photo has been uploaded successfully.\n\n` +
        `🔗 View your listing:\n${WEBAPP_URL}/marketplace?listing=${listing.id}\n\n` +
        `Reply *MENU* to return to the main menu.`
      );
    } catch (err) {
      console.error('[processImage error]', err.message);
      await updateSession(phone, { state: 'WELCOME' });
      return `❌ Sorry, we couldn't upload your image. Please try again or type *MENU* to go back.`;
    }
  }

  // Fallback if they send an image but aren't in a pending image state
  return (
    `📸 Got your image, but we aren't expecting one right now.\n\n` +
    `Reply *3* to diagnose a crop, *6* to add a listing, or *MENU* for options.`
  );
}

  // Old code block completely replaced above; leaving clean empty block
async function askGemini(question, history = [], lang = 'en') {
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return '❌ AI service unavailable.';

  try {
    const context = history.slice(-10).map(h => ({ role: h.role, parts: h.parts }));
    const languageNames = { en: 'English', tn: 'Tswana', fr: 'French', ny: 'Nyanja', be: 'Bemba' };
    const targetLang = languageNames[lang] || 'English';

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            ...context,
            { role: 'user', parts: [{ text: `System Instruction: Respond in ${targetLang}. Question: ${question}` }] }
          ]
        })
      }
    );
    if (!resp.ok) throw new Error('AI Fetch Error');
    const data = await resp.json();
    return (data.candidates?.[0]?.content?.parts?.[0]?.text || 'No answer received.').trim();
  } catch (e) {
    console.error('[Gemini AI Error]', e);
    return '❌ AI service error. A human agronomist will respond via SMS later.';
  }
}


/**
 * Process an incoming WhatsApp TEXT message and return the bot reply.
 * @param {string} phone
 * @param {string} rawText
 * @returns {Promise<string>}
 */
export async function processMessage(phone, rawText) {
  const text = (rawText || '').trim();
  const upper = text.toUpperCase();
  const session = await getSession(phone);
  const L = getLang(session.language);

  // ── Global commands (work from any state) ──────────────────────────────────
  if (upper === 'MENU' || upper === 'HI' || upper === 'HELLO' || upper === 'START') {
    await updateSession(phone, { state: 'WELCOME' });
    return L.welcome(session.linked);
  }

  if (upper === 'LINK') {
    await updateSession(phone, { state: 'AWAIT_LINK' });
    return L.await_link;
  }

  if (upper === 'CANCEL') {
    await updateSession(phone, { state: 'WELCOME' });
    return L.welcome(session.linked);
  }

  // ── State: WELCOME ─────────────────────────────────────────────────────────
  if (session.state === 'WELCOME') {
    if (text === '1') {
      await updateSession(phone, { state: 'ORDERS' });
      return MENU.ORDERS_PLACEHOLDER;
    }
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
    if (text === '9') {
      await updateSession(phone, { state: 'SET_LANGUAGE' });
      return L.change_lang;
    }
    return L.unknown;
  }

  // ── State: UPLOAD / DIAGNOSE PENDING ───────────────────────────────────────
  // (User sent text instead of an image while in an image-awaiting state)
  if (session.state === 'UPLOAD_PENDING' || session.state === 'DIAGNOSE_PENDING') {
    return (
      `📷 We're waiting for you to send a *photo*.\n\n` +
      `Please take a picture and send it here, or type *CANCEL* to go back.`
    );
  }

  // ── State: AWAIT_LINK ──────────────────────────────────────────────────────
  if (session.state === 'AWAIT_LINK') {
    if (isValidEmail(text)) {
      await updateSession(phone, { state: 'WELCOME', linked: true, email: text });
      return MENU.LINKED_OK(text);
    }
    return `❌ That doesn't look like a valid email. Please try again or type *CANCEL* to go back.`;
  }

  // ── State: MARKETPLACE ─────────────────────────────────────────────────────
  if (session.state === 'MARKETPLACE') {
    if (text === '0') {
      await updateSession(phone, { state: 'WELCOME' });
      return MENU.WELCOME(session.linked);
    }
    const query = upper === 'ALL' ? '' : text.toLowerCase();
    

    const results = MOCK_LISTINGS.filter(
      (l) => !query || l.produce.toLowerCase().includes(query)
    );
    return formatListings(results);
  }

  // ── State: ORDERS ──────────────────────────────────────────────────────────
  if (session.state === 'ORDERS') {
    await updateSession(phone, { state: 'WELCOME' });
    return `📦 *My Orders*\n\nYou currently have *0* active orders.\n\nType *MENU* to return.`;
  }

  // ── State: CREDIT ──────────────────────────────────────────────────────────
  if (session.state === 'CREDIT') {
    if (text === '1') return MENU.CREDIT_SCORE(745);
    if (text === '2') {
      await updateSession(phone, { state: 'CREDIT_APPLY' });
      return MENU.CREDIT_APPLY_PROMPT;
    }
    if (text === '0') {
      await updateSession(phone, { state: 'WELCOME' });
      return MENU.WELCOME(session.linked);
    }
    return MENU.UNKNOWN;
  }

  // ── State: CREDIT_APPLY ────────────────────────────────────────────────────
  if (session.state === 'CREDIT_APPLY') {
    const amount = parseFloat(text.replace(/[^0-9.]/g, ''));
    if (!isNaN(amount) && amount > 0) {
      await updateSession(phone, { state: 'WELCOME' });
      return MENU.CREDIT_APPLY_OK(text);
    }
    return `❌ Please enter a valid numeric amount (e.g. _5000_) or type *CANCEL*.`;
  }

  // ── State: WEATHER ─────────────────────────────────────────────────────────
  if (session.state === 'WEATHER') {
    await updateSession(phone, { state: 'WELCOME' });
    return MENU.WELCOME(session.linked);
  }

  // ── State: AGRONOMIST ──────────────────────────────────────────────────────
  if (session.state === 'AGRONOMIST') {
    if (upper === '0' || upper === 'MENU') {
      await updateSession(phone, { state: 'WELCOME', history: [] });
      return L.welcome(session.linked);
    }
    if (text.length < 3) return `❌ ${L.unknown}`;
    
    sendWhatsApp(phone, L.thinking).catch(()=>{});

    const answer = await askGemini(text, session.history, session.language);
    
    const newHistory = [
      ...(session.history || []),
      { role: 'user', parts: [{ text }] },
      { role: 'model', parts: [{ text: answer }] }
    ];
    await updateSession(phone, { history: newHistory.slice(-10) });

    return `🧑‍🌾 *mARI Agronomist:*\n\n${answer}\n\n${L.menu_back || 'Type MENU to exit.'}`;
  }

  // ── State: SET_LANGUAGE ──────────────────────────────────────────────────
  if (session.state === 'SET_LANGUAGE') {
    let newLang = 'en';
    if (text === '1') newLang = 'en';
    else if (text === '2') newLang = 'tn';
    else if (text === '3') newLang = 'fr';
    else if (text === '4') newLang = 'ny';
    else if (text === '5') newLang = 'be';
    else return L.change_lang;

    await updateSession(phone, { state: 'WELCOME', language: newLang });
    const NL = getLang(newLang);
    return `✅ Language updated!\n\n` + NL.welcome(session.linked);
  }

  // ── State: DIAGNOSE_FOLLOWUP ───────────────────────────────────────────────
  if (session.state === 'DIAGNOSE_FOLLOWUP') {
    if (upper === '0' || upper === 'MENU') {
      await updateSession(phone, { state: 'WELCOME', history: [] });
      return L.welcome(session.linked);
    }

    sendWhatsApp(phone, L.thinking).catch(()=>{});
    const answer = await askGemini(text, session.history, session.language);

    const newHistory = [
      ...(session.history || []),
      { role: 'user', parts: [{ text }] },
      { role: 'model', parts: [{ text: answer }] }
    ];
    await updateSession(phone, { history: newHistory.slice(-10) });

    return `🔬 *Diagnostic Follow-up:*\n\n${answer}\n\n${L.menu_back || 'Type MENU to exit.'}`;
  }

  // ── Fallback ───────────────────────────────────────────────────────────────
  return L.welcome(session.linked);
}
