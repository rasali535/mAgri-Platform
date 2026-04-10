/**
 * whatsapp/africa.js
 * Thin wrapper around Africa's Talking REST API for sending SMS and WhatsApp
 * messages WITHOUT requiring the africastalking npm package ESM quirks.
 * Uses the native fetch() available in Node >= 18.
 */

const AT_BASE = 'https://api.africastalking.com/version1';

function getCredentials() {
  return {
    username: process.env.AT_USERNAME || 'sandbox',
    apiKey: process.env.AT_API_KEY || '',
  };
}

/**
 * Send an SMS to one or more recipients.
 * @param {string|string[]} to  E.164 phone number(s), e.g. "+254712345678"
 * @param {string} message
 */
export async function sendSMS(to, message) {
  const { username, apiKey } = getCredentials();

  if (!apiKey) {
    console.log(`[SIMULATED SMS → ${to}]: ${message}`);
    return { simulated: true };
  }

  const toStr = Array.isArray(to) ? to.join(',') : to;

  const res = await fetch(`${AT_BASE}/messaging`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      apiKey,
    },
    body: new URLSearchParams({ username, to: toStr, message }),
  });

  const text = await res.text();
  try {
    const data = JSON.parse(text);
    console.log('[AT SMS]', JSON.stringify(data));
    return data;
  } catch (e) {
    console.error('[AT SMS ERR] Non-JSON response:', text);
    return { error: 'Non-JSON response', raw: text };
  }
}

import { sock } from './baileys.js';

/**
 * Send a WhatsApp message via Baileys.
 *
 * @param {string} to      Recipient phone number in E.164 format
 * @param {string} message Text body
 */
export async function sendWhatsApp(to, message) {
  if (!sock) {
    console.error('Baileys socket is not initialized yet. Cannot send message to', to);
    return;
  }
  
  // Ensure we format the clean number to Baileys JID format
  const cleanTo = to.replace(/^whatsapp:\+?/, '').replace(/^\+/, '');
  const jid = `${cleanTo}@s.whatsapp.net`;
  
  try {
    await sock.sendMessage(jid, { text: message });
  } catch (err) {
    console.error('Error sending message via Baileys:', err);
  }
}
