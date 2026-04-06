/**
 * whatsapp/notify.js
 *
 * Server-side notification helpers.
 * Call these after key user actions (order placed, credit approved, etc.)
 * to send a WhatsApp (or SMS fallback) confirmation.
 *
 * Usage example in index.js:
 *   import { notifyOrderConfirmation } from './whatsapp/notify.js';
 *   await notifyOrderConfirmation(phone, { id: 'ORD-001', produce: 'Maize', qty: '5kg' });
 */

import { sendWhatsApp, sendSMS } from './africa.js';

const WEBAPP_URL = process.env.WEBAPP_URL || 'https://navajowhite-monkey-252201.hostingersite.com';

/**
 * Notify a user that their marketplace order/contact request was received.
 */
export async function notifyOrderConfirmation(phone, { id, produce, qty, seller }) {
  const msg =
    `✅ *Pameltex Tech Order Confirmation*\n\n` +
    `Your enquiry for *${qty} of ${produce}* has been sent to *${seller || 'the seller'}*.\n\n` +
    `📋 Ref: ${id}\n` +
    `🌐 Track on web: ${WEBAPP_URL}\n\n` +
    `Reply *MENU* to return to the Pameltex Tech bot.`;

  return sendWhatsApp(phone, msg);
}

/**
 * Notify a user that their credit application was received.
 */
export async function notifyCreditApplication(phone, { amount, currency = '' }) {
  const msg =
    `💳 *Pameltex Tech Credit Application*\n\n` +
    `Your application for *${currency}${amount}* micro-credit has been received.\n` +
    `Our team will review and respond within 24–48 hours.\n\n` +
    `🌐 Check status: ${WEBAPP_URL}\n\n` +
    `Reply *MENU* for the main menu.`;

  return sendWhatsApp(phone, msg);
}

/**
 * Notify a user that their credit application was approved.
 */
export async function notifyCreditApproved(phone, { amount, currency = '', rate }) {
  const msg =
    `🎉 *Credit Approved!*\n\n` +
    `Your Pameltex Tech micro-credit of *${currency}${amount}* at *${rate}% p.a.* has been approved.\n\n` +
    `Funds will be disbursed to your mobile wallet within 2 hours.\n` +
    `🌐 Details: ${WEBAPP_URL}\n\n` +
    `Reply *MENU* for the main menu.`;

  return sendWhatsApp(phone, msg);
}

/**
 * Send an SMS fallback (useful if WhatsApp is unavailable).
 */
export async function notifyViaSMS(phone, message) {
  return sendSMS(phone, message);
}

/**
 * Generic WhatsApp notification (for custom messages).
 */
export async function notifyWhatsApp(phone, message) {
  return sendWhatsApp(phone, message);
}
