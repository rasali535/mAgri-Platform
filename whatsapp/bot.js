/**
 * whatsapp/bot.js
 * Core WhatsApp conversational menu logic.
 *
 * processMessage(phone, incomingText) → string (reply to send back)
 *
 * The bot uses a simple finite-state machine stored in sessions.js.
 * Marketplace listings are pulled from an in-memory mock (replace with
 * real Supabase queries in production).
 */

import { getSession, updateSession, resetSession } from './sessions.js';
import { MENU } from './menu.js';

// ─── Marketplace mock data (mirrors MarketplaceTab.tsx) ──────────────────────
const MOCK_LISTINGS = [
  { type: 'buy',  produce: 'Maize',       qty: '5 Tons',   price: 'Negotiable', location: 'Lusaka, ZM',   user: 'AgriCorp' },
  { type: 'sell', produce: 'Cocoa Beans', qty: '200 kg',   price: '$60/kg',     location: 'Abidjan, CI',  user: 'Kouame'   },
  { type: 'buy',  produce: 'Cashew Nuts', qty: '1 Ton',    price: 'Negotiable', location: 'Bouaké, CI',   user: 'Export Co.' },
  { type: 'sell', produce: 'Tomatoes',    qty: '50 kg',    price: '$0.30/kg',   location: 'Ndola, ZM',    user: 'Grace'    },
  { type: 'sell', produce: 'Onions',      qty: '500 kg',   price: '$0.12/kg',   location: 'Livingstone',  user: 'Banda'    },
  { type: 'buy',  produce: 'Soybeans',    qty: '10 Tons',  price: 'Negotiable', location: 'Kitwe, ZM',    user: 'Global Feed' },
];

const WEBAPP_URL = process.env.WEBAPP_URL || 'https://navajowhite-monkey-252201.hostingersite.com';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatListings(listings) {
  if (!listings.length) return '🔍 No listings found for that search.';
  return (
    listings
      .slice(0, 5) // WhatsApp messages have limits; show up to 5
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

// ─── Main FSM ────────────────────────────────────────────────────────────────

/**
 * Process an incoming WhatsApp message and return the bot reply.
 */
export async function processMessage(phone, rawText) {
  const text = (rawText || '').trim();
  const upper = text.toUpperCase();
  const session = getSession(phone);

  // ── Global commands (work from any state) ──────────────────────────────────
  if (upper === 'MENU' || upper === 'HI' || upper === 'HELLO' || upper === 'START') {
    updateSession(phone, { state: 'WELCOME' });
    return MENU.WELCOME(session.linked);
  }

  if (upper === 'LINK') {
    updateSession(phone, { state: 'AWAIT_LINK' });
    return MENU.AWAIT_LINK;
  }

  if (upper === 'CANCEL') {
    updateSession(phone, { state: 'WELCOME' });
    return MENU.WELCOME(session.linked);
  }

  // ── State: WELCOME ─────────────────────────────────────────────────────────
  if (session.state === 'WELCOME') {
    if (text === '1') {
      updateSession(phone, { state: 'MARKETPLACE' });
      return MENU.MARKETPLACE_LOADING;
    }
    if (text === '2') {
      updateSession(phone, { state: 'ORDERS' });
      return MENU.ORDERS_PLACEHOLDER;
    }
    if (text === '3') {
      updateSession(phone, { state: 'CREDIT' });
      return MENU.CREDIT_MENU;
    }
    if (text === '4') {
      updateSession(phone, { state: 'WEATHER' });
      const forecast =
        '☀️ Today: Sunny, 28°C\n' +
        '🌧 Tomorrow: Light showers, 24°C\n' +
        '🌤 Day 3: Partly cloudy, 26°C\n\n' +
        '_Powered by Open-Meteo. Forecasts for your region._';
      return MENU.WEATHER(forecast);
    }
    if (text === '5') {
      updateSession(phone, { state: 'AGRONOMIST' });
      return MENU.AGRONOMIST_PROMPT;
    }
    if (text === '6') {
      return MENU.WEBAPP_LINK(WEBAPP_URL);
    }
    return MENU.UNKNOWN;
  }

  // ── State: AWAIT_LINK ──────────────────────────────────────────────────────
  if (session.state === 'AWAIT_LINK') {
    if (isValidEmail(text)) {
      // In production: query Supabase to verify the email exists
      updateSession(phone, { state: 'WELCOME', linked: true, email: text });
      return MENU.LINKED_OK(text);
    }
    return `❌ That doesn't look like a valid email. Please try again or type *CANCEL* to go back.`;
  }

  // ── State: MARKETPLACE ─────────────────────────────────────────────────────
  if (session.state === 'MARKETPLACE') {
    if (text === '0') {
      updateSession(phone, { state: 'WELCOME' });
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
    if (text === '1') {
      // Simulate score lookup; in production: query Supabase for the user's score
      return MENU.CREDIT_SCORE(745);
    }
    if (text === '2') {
      updateSession(phone, { state: 'CREDIT_APPLY' });
      return MENU.CREDIT_APPLY_PROMPT;
    }
    if (text === '0') {
      updateSession(phone, { state: 'WELCOME' });
      return MENU.WELCOME(session.linked);
    }
    return MENU.UNKNOWN;
  }

  // ── State: CREDIT_APPLY ────────────────────────────────────────────────────
  if (session.state === 'CREDIT_APPLY') {
    const amount = parseFloat(text.replace(/[^0-9.]/g, ''));
    if (!isNaN(amount) && amount > 0) {
      updateSession(phone, { state: 'WELCOME' });
      // In production: save application to Supabase
      return MENU.CREDIT_APPLY_OK(text);
    }
    return `❌ Please enter a valid numeric amount (e.g. _5000_) or type *CANCEL*.`;
  }

  // ── State: WEATHER ─────────────────────────────────────────────────────────
  if (session.state === 'WEATHER') {
    updateSession(phone, { state: 'WELCOME' });
    return MENU.WELCOME(session.linked);
  }

  // ── State: AGRONOMIST ──────────────────────────────────────────────────────
  if (session.state === 'AGRONOMIST') {
    if (text.length < 5) {
      return `❌ Your question is too short. Please elaborate a little more.`;
    }
    // In production: save the question to Supabase and notify agronomists
    console.log(`[AGRONOMIST QUESTION from ${phone}]: ${text}`);
    updateSession(phone, { state: 'WELCOME' });
    return MENU.AGRONOMIST_OK;
  }

  // ── State: ORDERS ──────────────────────────────────────────────────────────
  if (session.state === 'ORDERS') {
    updateSession(phone, { state: 'WELCOME' });
    return MENU.WELCOME(session.linked);
  }

  // ── Fallback ───────────────────────────────────────────────────────────────
  return MENU.WELCOME(session.linked);
}
