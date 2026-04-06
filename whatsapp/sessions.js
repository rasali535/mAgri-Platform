/**
 * whatsapp/sessions.js
 * In-memory session store for WhatsApp conversation state.
 * Each key is a phone number (E.164), value is a session object.
 *
 * For production: replace with Redis or a DB-backed store.
 */

const sessions = new Map();

/**
 * Get session for a phone number. Creates a fresh one if none exists.
 */
export function getSession(phone) {
  if (!sessions.has(phone)) {
    sessions.set(phone, {
      phone,
      state: 'WELCOME',          // current menu state
      linked: false,             // has the user linked their Pameltex Tech account?
      email: null,               // linked Pameltex Tech email
      history: [],               // last few bot exchanges for context
      lastUpdated: Date.now(),
    });
  }
  return sessions.get(phone);
}

/**
 * Update fields of an existing session.
 */
export function updateSession(phone, patch) {
  const session = getSession(phone);
  Object.assign(session, patch, { lastUpdated: Date.now() });
  sessions.set(phone, session);
  return session;
}

/**
 * Reset a session back to WELCOME state (e.g. after inactivity or explicit reset).
 */
export function resetSession(phone) {
  sessions.set(phone, {
    phone,
    state: 'WELCOME',
    linked: false,
    email: null,
    history: [],
    lastUpdated: Date.now(),
  });
}
