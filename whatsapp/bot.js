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
import { uploadMediaToSupabase } from './imageUploader.js';
import { createListing } from './listingsStore.js';

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

// ─── Image handler (called when Meta sends an image message) ──────────────────

/**
 * Process an incoming WhatsApp IMAGE message.
 * If the session is UPLOAD_PENDING, upload to Supabase and create a listing.
 *
 * @param {string} phone   – E.164 phone number
 * @param {string} mediaId – Meta image media_id
 * @returns {Promise<string>} reply text
 */
export async function processImage(phone, mediaId) {
  const session = await getSession(phone);

  if (session.state !== 'UPLOAD_PENDING') {
    // Farmer isn't in upload mode — gently prompt them to use the menu
    return (
      `📸 Got your image, but you haven't started a listing yet.\n\n` +
      `Reply *7* to add a crop listing, or *MENU* to see options.`
    );
  }

  try {
    // 1. Upload image from Meta → Supabase Storage
    const publicUrl = await uploadMediaToSupabase(mediaId, phone);

    // 2. Save listing row to Supabase DB
    const listing = await createListing(phone, publicUrl);

    // 3. Reset session back to WELCOME
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

// ─── Main FSM ────────────────────────────────────────────────────────────────

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

  // ── Global commands (work from any state) ──────────────────────────────────
  if (upper === 'MENU' || upper === 'HI' || upper === 'HELLO' || upper === 'START') {
    await updateSession(phone, { state: 'WELCOME' });
    return MENU.WELCOME(session.linked);
  }

  if (upper === 'LINK') {
    await updateSession(phone, { state: 'AWAIT_LINK' });
    return MENU.AWAIT_LINK;
  }

  if (upper === 'CANCEL') {
    await updateSession(phone, { state: 'WELCOME' });
    return MENU.WELCOME(session.linked);
  }

  // ── State: WELCOME ─────────────────────────────────────────────────────────
  if (session.state === 'WELCOME') {
    if (text === '1') {
      await updateSession(phone, { state: 'MARKETPLACE' });
      return MENU.MARKETPLACE_LOADING;
    }
    if (text === '2') {
      await updateSession(phone, { state: 'ORDERS' });
      return MENU.ORDERS_PLACEHOLDER;
    }
    if (text === '3') {
      await updateSession(phone, { state: 'CREDIT' });
      return MENU.CREDIT_MENU;
    }
    if (text === '4') {
      await updateSession(phone, { state: 'WEATHER' });
      const forecast =
        '☀️ Today: Sunny, 28°C\n' +
        '🌧 Tomorrow: Light showers, 24°C\n' +
        '🌤 Day 3: Partly cloudy, 26°C\n\n' +
        '_Powered by Open-Meteo. Forecasts for your region._';
      return MENU.WEATHER(forecast);
    }
    if (text === '5') {
      await updateSession(phone, { state: 'AGRONOMIST' });
      return MENU.AGRONOMIST_PROMPT;
    }
    if (text === '6') {
      return MENU.WEBAPP_LINK(WEBAPP_URL);
    }
    if (text === '7') {
      // Farmer wants to add a listing — put them in UPLOAD_PENDING state
      await updateSession(phone, { state: 'UPLOAD_PENDING' });
      return (
        `📸 *Add a Crop Listing*\n\n` +
        `Please send a photo of your crop.\n` +
        `Once received, we will create your marketplace listing automatically.\n\n` +
        `Type *CANCEL* at any time to go back.`
      );
    }
    return MENU.UNKNOWN;
  }

  // ── State: UPLOAD_PENDING ──────────────────────────────────────────────────
  // (User sent text instead of an image while in upload mode)
  if (session.state === 'UPLOAD_PENDING') {
    return (
      `📷 We\'re waiting for a *photo* of your crop.\n\n` +
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
    if (text.length < 5) {
      return `❌ Your question is too short. Please elaborate a little more.`;
    }
    console.log(`[AGRONOMIST QUESTION from ${phone}]: ${text}`);
    await updateSession(phone, { state: 'WELCOME' });
    return MENU.AGRONOMIST_OK;
  }

  // ── State: ORDERS ──────────────────────────────────────────────────────────
  if (session.state === 'ORDERS') {
    await updateSession(phone, { state: 'WELCOME' });
    return MENU.WELCOME(session.linked);
  }

  // ── Fallback ───────────────────────────────────────────────────────────────
  return MENU.WELCOME(session.linked);
}
