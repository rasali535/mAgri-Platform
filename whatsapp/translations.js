/**
 * whatsapp/translations.js
 * Centralized localization dictionary.
 * 
 * Supported: en, tn (Tswana), fr (French), ny (Nyanja), be (Bemba)
 */

export const TRANSLATIONS = {
  en: {
    welcome: (linked, name) => `🌱 *Welcome ${name ? name + ' ' : ''}to mARI Platform by Pameltex Tech!* \n\n` +
      (linked ? `` : `⚠️ Your WhatsApp number is not linked yet. Send *LINK* to connect your account, or continue as a guest.\n\n`) +
      `Please choose an option:\n` +
      `1️⃣  Dashboard & Orders\n` +
      `2️⃣  Marketplace\n` +
      `3️⃣  Crop Scan (mARI AI) 🔍\n` +
      `4️⃣  Ask mARI (AI Advisor)\n` +
      `5️⃣  Finance & Credit\n` +
      `6️⃣  Weather Forecast\n` +
      `7️⃣  Farmer Community\n` +
      `8️⃣  Vuka Social Network 👥\n` +
      `9️⃣  Language Settings 🌍\n` +
      `🔟  Mpotsa Q&A Engine 📚\n\n` +
      `Reply with a number (1–10) or type *MENU* anytime to return.\n\n` +
      `📅 _Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}_`,
    change_lang: "🌍 *Select Language:*\n1. English\n2. Tswana\n3. French\n4. Nyanja\n5. Bemba\n\nType *CANCEL* to go back.",
    ussd_lang: "CON Select Language:\n1. English\n2. Tswana\n3. French\n4. Nyanja\n5. Bemba",
    ussd_menu: "CON Welcome to mARI Platform by Pameltex Tech\n1. Dashboard\n2. Marketplace\n3. Crop Scan\n4. AI Advisor\n5. Finance\n6. Weather\n7. Community\n8. Vuka Social\n9. Language\n10. Mpotsa Q&A\n11. Subscription",
    thinking: "⏳ Thinking...",
    menu_back: "Type *MENU* to return.",
    unknown: "❓ Unknown option. Type *MENU*.",
    await_link: "📧 Please send your email address to link your account. Type *CANCEL* to go back.",
    linked_ok: (email) => `✅ Linked to *${email}*. Type *MENU* to return.`,
    diagnose_prompt: "🔍 *Crop Scan*\nPlease send a photo of your diseased plant for mARI to analyze.",
    agronomist_prompt: "🧑‍🌾 *Ask mARI AI Advisor*\nType your farming question below.",
  },
  tn: {
    welcome: (linked) => `🌱 *Amogela mo mARI Platform by Pameltex Tech!*\n\n1. Tesheboto\n2. Marekelo\n3. Crop Scan 🔍\n4. Ask mARI (Advisor)\n5. Finance\n6. Weather\n7. Community\n8. Vuka Social 👥\n9. Fetola Puo 🌍\n10. Mpotsa Q&A\n11. Subscription 📚`,

    change_lang: "🌍 *Tlhopha Puo:*\n1. English\n2. Tswana\n3. French\n4. Nyanja\n5. Bemba",
    ussd_menu: "CON mARI Platform by Pameltex Tech\n1. Dashboard\n2. Marketplace\n3. Crop Scan\n4. AI Advisor\n5. Finance\n6. Weather\n7. Community\n8. Vuka Social\n9. Language\n10. Mpotsa Q&A\n11. Subscription",
    thinking: "⏳ Ke a akanya...",
    unknown: "❓ Ga ke utlwe. Thapa *MENU*.",
  },
  fr: {
    welcome: (linked) => `🌱 *Bienvenue sur mARI Platform by Pameltex Tech!*\n\n1. Tableau de bord\n2. Marché\n3. Scanner Culture 🔍\n4. Ask mARI (Conseiller)\n5. Finance\n6. Météo\n7. Communauté\n8. Réseau Vuka 👥\n9. Changer Langue 🌍\n10. Mpotsa Q&A\n11. Subscription 📚`,

    change_lang: "🌍 *Choisir la langue:*\n1. English\n2. Tswana\n3. French\n4. Nyanja\n5. Bemba",
    ussd_menu: "CON mARI Platform by Pameltex Tech\n1. Dashboard\n2. Marché\n3. Crop Scan\n4. AI Advisor\n5. Finance\n6. Météo\n7. Communauté\n8. Réseau Vuka\n9. Language\n10. Mpotsa Q&A\n11. Subscription",
    thinking: "⏳ Analyse...",
    unknown: "❓ Option inconnue. Tapez *MENU*.",
  },
  ny: {
    welcome: (linked) => `🌱 *Takulandirani ku mARI Platform by Pameltex Tech!*\n\n1. Dashboard\n2. Market\n3. Crop Scan 🔍\n4. Funzani mARI (Advisor)\n5. Finance\n6. Weather\n7. Community\n8. Vuka Social 👥\n9. Sinthani Chilankhulo 🌍\n10. Mpotsa Q&A\n11. Subscription 📚`,

    change_lang: "🌍 *Sankhani Chilankhulo:*\n1. English\n2. Tswana\n3. French\n4. Nyanja\n5. Bemba",
    ussd_menu: "CON mARI Platform by Pameltex Tech\n1. Dashboard\n2. Market\n3. Crop Scan\n4. AI Advisor\n5. Finance\n6. Weather\n7. Community\n8. Vuka Social\n9. Language\n10. Mpotsa Q&A\n11. Subscription",
    thinking: "⏳ Ndikuganiza...",
    unknown: "❓ Siziwika. Lembani *MENU*.",
  },
  be: {
    welcome: (linked) => `🌱 *Mwaiseni mu mARI Platform by Pameltex Tech!*\n\n1. Dashboard\n2. Market\n3. Crop Scan 🔍\n4. Sipusheni mARI (Advisor)\n5. Finance\n6. Weather\n7. Community\n8. Vuka Social 👥\n9. Alyeni Ululimi 🌍\n10. Mpotsa Q&A\n11. Subscription 📚`,

    change_lang: "🌍 *Saleni Ululimi:*\n1. English\n2. Tswana\n3. French\n4. Nyanja\n5. Bemba",
    ussd_menu: "CON mARI Platform by Pameltex Tech\n1. Dashboard\n2. Market\n3. Crop Scan\n4. AI Advisor\n5. Finance\n6. Weather\n7. Community\n8. Vuka Social\n9. Language\n10. Mpotsa Q&A\n11. Subscription",
    thinking: "⏳ Ndekutontonkanya...",
    unknown: "❓ Tafishibikwe. Lembani *MENU*.",
  }
};

export const getLang = (lang = 'en') => TRANSLATIONS[lang] || TRANSLATIONS['en'];
