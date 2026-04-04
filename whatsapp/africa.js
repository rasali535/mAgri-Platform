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

  const data = await res.json();
  console.log('[AT SMS]', JSON.stringify(data));
  return data;
}

/**
 * Send a WhatsApp message via Africa's Talking.
 * Requires your AT account to have the WhatsApp channel enabled.
 *
 * @param {string} to      Recipient phone number in E.164 format (without "whatsapp:")
 * @param {string} message Text body
 */
export async function sendWhatsApp(to, message) {
  const { username, apiKey } = getCredentials();

  if (!apiKey) {
    console.log(`[SIMULATED WhatsApp → ${to}]: ${message}`);
    return { simulated: true };
  }

  // Ensure number has no prefix
  const cleanTo = to.replace(/^whatsapp:\+?/, '').replace(/^\+/, '');
  const toE164 = `+${cleanTo}`;

  const res = await fetch(`${AT_BASE}/messaging`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      apiKey,
    },
    body: new URLSearchParams({
      username,
      to: toE164,
      message,
      channel: 'whatsapp',
    }),
  });

  const data = await res.json();
  console.log('[AT WhatsApp]', JSON.stringify(data));
  return data;
}
