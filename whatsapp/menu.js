/**
 * whatsapp/menu.js
 * Menu state machine for the mARI WhatsApp conversational bot.
 *
 * STATES:
 *   WELCOME         → User just started or returned to main menu
 *   AWAIT_LINK      → Waiting for the user to provide their email for account linking
 *   MARKETPLACE     → Browsing available market listings
 *   ORDERS          → Viewing order status
 *   CREDIT          → Credit score / micro-credit sub-menu
 *   CREDIT_APPLY    → Awaiting credit amount from user
 *   WEATHER         → Weather forecast
 *   AGRONOMIST      → Asking agronomist a question
 *   AGRONOMIST_Q    → Waiting for the user's question
 *   UPLOAD_PENDING  → Waiting for the farmer to send a crop image for a listing
 */

// ─── Static text blocks ────────────────────────────────────────────────────────

export const MENU = {
  WELCOME: (linked) =>
    `🌱 *Welcome to mARI Platform by Pameltex Tech!*\n` +
    (linked ? `` : `\n⚠️ Your WhatsApp number is not linked yet. Send *LINK* to connect your account, or continue as a guest.\n`) +
    `\nPlease choose an option:\n` +
    `1️⃣  Dashboard & Orders\n` +
    `2️⃣  Marketplace\n` +
    `3️⃣  Crop Scan (mARI AI) 🔍\n` +
    `4️⃣  Ask mARI (AI Advisor)\n` +
    `5️⃣  Finance & Credit\n` +
    `6️⃣  Weather Forecast\n` +
    `7️⃣  Farmer Community\n` +
    `8️⃣  Vuka Social Network 👥\n` +
    `9️⃣  Language Settings\n` +
    `🔟  Mpotsa Q&A Engine 📚\n` +
    `\nReply with a number (1–10) or type *MENU* anytime to return.`,

  AWAIT_LINK:
    `📧 Please send your mARI Platform by Pameltex Tech email address to link your WhatsApp number.\n` +
    `Example: _you@example.com_\n\nType *CANCEL* to go back.`,

  LINKED_OK: (email) =>
    `✅ Your WhatsApp is now linked to *${email}*.\n\nType *MENU* to return to the main menu.`,

  MARKETPLACE_LOADING:
    `🛒 *mARI Platform by Pameltex Tech Market*\nFetching live listings...\n\nReply with:\n• A *crop name* to search (e.g. _Maize_, _Cocoa_)\n• *ALL* to see all listings\n• *0* to go back`,

  CREDIT_MENU:
    `💳 *Credit & Finance*\n\n` +
    `1️⃣  Check my Credit Score\n` +
    `2️⃣  Apply for Micro-Credit\n` +
    `0️⃣  Back to main menu`,

  CREDIT_SCORE: (score) =>
    `📊 Your current mARI Platform by Pameltex Tech Credit Score is *${score}* (Excellent).\n\nKeep up responsible trading to maintain a high score!\n\nReply *0* to go back.`,

  CREDIT_APPLY_PROMPT:
    `💰 How much credit are you applying for?\n` +
    `Enter the amount in your local currency (e.g. _5000_).\n\nType *CANCEL* to go back.`,

  CREDIT_APPLY_OK: (amount) =>
    `✅ Your application for *${amount}* micro-credit has been received!\nOur team will review and send you an SMS confirmation shortly.\n\nReply *MENU* to return.`,

  WEATHER: (forecast) =>
    `🌦 *Weather Forecast*\n\n${forecast}\n\nReply *MENU* to return.`,

  DIAGNOSE_PROMPT: 
    `🔍 *Crop Scan (mARI AI Diagnosis)*\n\n` +
    `Please take a clear, close-up photo of your diseased plant or crop and send it here.\n` +
    `mARI will instantly analyze it for diseases and provide recommendations.\n\n` +
    `Type *CANCEL* to go back.`,

  AGRONOMIST_PROMPT:
    `🧑‍🌾 *Ask mARI (AI Advisor)*\n\nType your farming question below and mARI will provide expert agronomy advice instantly.\n\nExample: _"What is the best fertilizer for tomatoes in sandy soil?"_\n\nType *CANCEL* to go back.`,

  AGRONOMIST_OK:
    `✅ Your question has been sent to our expert agronomists.\nExpect a reply within 24 hours.\n\nReply *MENU* to return.`,

  WEBAPP_LINK: (url) =>
    `🌐 *Open mARI Platform by Pameltex Tech*\n\nAccess the full web app here:\n${url}\n\nAll features are available on the website including listings, finance, weather, and more.\n\nReply *MENU* to return.`,

  ORDERS_PLACEHOLDER:
    `📦 *My Orders*\n\nYou have *no active orders* at the moment.\nVisit the web app to place or manage orders.\n\nReply *MENU* to return.`,

  UNKNOWN:
    `❓ I didn't understand that. Please reply with a number from the menu or type *MENU* to start over.`,

  VUKA_MENU:
    `👥 *Vuka Social Network*\n\n` +
    `1️⃣  My Social Profile\n` +
    `2️⃣  Social Feed\n` +
    `3️⃣  Create a Post\n` +
    `4️⃣  Group Chats\n` +
    `5️⃣  Find Friends\n` +
    `0️⃣  Back to main menu`,

  MPOTSA_PROMPT:
    `📚 *Mpotsa Universal Q&A*\n` +
    `Ask any question (Farming, Health, Legal, Jobs, or General Knowledge).\n\n` +
    `Type *CANCEL* to go back.`,

  ERROR:
    `⚠️ Something went wrong on our end. Please try again in a moment or type *MENU* to restart.`,
};

