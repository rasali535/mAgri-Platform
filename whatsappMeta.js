import fetch from 'node-fetch';

export async function sendMetaMessage(to, text) {
  const TOKEN = process.env.META_WHATSAPP_TOKEN;
  const PHONE_ID = process.env.META_WHATSAPP_PHONE_ID;
  const API_URL = `https://graph.facebook.com/v18.0/${PHONE_ID}/messages`;

  if (!TOKEN || !PHONE_ID) {
    console.log(`[SIMULATED Meta WhatsApp → ${to}]: ${text}`);
    return { simulated: true };
  }

  try {
    const cleanTo = to.replace(/^\+/, ''); // meta usually expects the plain number without +

    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanTo,
        type: 'text',
        text: { body: text },
      }),
    });
    
    const data = await resp.json();
    if (!resp.ok) {
      console.error('Meta send error:', data);
    } else {
      console.log('[Meta WhatsApp Sent]', data);
    }
    return data;
  } catch (e) {
    console.error('Meta send exception:', e);
  }
}
