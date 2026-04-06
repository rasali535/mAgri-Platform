/**
 * whatsapp/translations.js
 * Centralized localization dictionary.
 * 
 * Supported: en, tn (Tswana), fr (French), ny (Nyanja), be (Bemba)
 */

export const TRANSLATIONS = {
  en: {
    welcome: (linked) => `Welcome to mARI Platform!\n\n` +
      (linked ? `` : `⚠️ Your WhatsApp number is not linked yet. Send *LINK* to connect your account, or continue as a guest.\n\n`) +
      `Please choose an option:\n` +
      `1️⃣  Dashboard & Orders\n` +
      `2️⃣  Marketplace\n` +
      `3️⃣  Crop Scan (mARI AI Diagnosis) 🔍\n` +
      `4️⃣  Ask mARI (AI Advisor)\n` +
      `5️⃣  Finance & Credit\n` +
      `6️⃣  Add a Crop Listing 📸\n` +
      `7️⃣  Open Web App 🔗\n` +
      `8️⃣  Weather Forecast\n\n` +
      `Reply with a number (1–8) or type *MENU* anytime to return.\n` +
      `🌍 Send *9* to Change Language.`,
    change_lang: "🌍 *Select Language:*\n1. English\n2. Tswana\n3. French\n4. Nyanja\n5. Bemba\n\nType *CANCEL* to go back.",
    ussd_lang: "CON Select Language:\n1. English\n2. Tswana\n3. French\n4. Nyanja\n5. Bemba",
    ussd_menu: "CON Welcome to Pameltex Tech\n1. Dashboard\n2. Market\n3. Crop Scan\n4. Ask mARI\n5. Credit\n6. Listing\n7. Web App\n8. Weather\n9. Change Language",
    thinking: "⏳ Thinking...",
    menu_back: "Type *MENU* to return.",
    unknown: "❓ Unknown option. Type *MENU*.",
    await_link: "📧 Please send your email address to link your account. Type *CANCEL* to go back.",
    linked_ok: (email) => `✅ Linked to *${email}*. Type *MENU* to return.`,
    diagnose_prompt: "🔍 *Crop Scan*\nPlease send a photo of your diseased plant for mARI to analyze.",
    agronomist_prompt: "🧑‍🌾 *Ask mARI AI Advisor*\nType your farming question below.",
  },
  tn: {
    welcome: (linked) => `🌱 *Amogela mo mARI Platform!*\n\n1. Tesheboto\n2. Marekelo\n3. Crop Scan 🔍\n4. Botsa mARI\n5. Madi\n6. Tsenya Phahlo 📸\n7. Web App\n8. Weather\n9. Fetola Puo 🌍`,
    change_lang: "🌍 *Tlhopha Puo:*\n1. English\n2. Tswana\n3. French\n4. Nyanja\n5. Bemba",
    ussd_lang: "CON Tlhopha Puo:\n1. English\n2. Tswana\n3. French\n4. Nyanja\n5. Bemba",
    ussd_menu: "CON Amogela mo mARI Platform\n1. Tesheboto\n2. Marekelo\n3. Crop Scan\n4. Botsa mARI\n5. Khrediti\n6. Phahlo\n7. Web App\n8. Weather\n9. Fetola Puo",
    thinking: "⏳ Ke a akanya...",
    unknown: "❓ Ga ke utlwe. Thapa *MENU*.",
  },
  fr: {
    welcome: (linked) => `🌱 *Bienvenue sur mARI Platform!*\n\n1. Tableau de bord\n2. Marché\n3. Scanner Culture 🔍\n4. Demander à mARI\n5. Finance\n6. Ajouter Offre 📸\n7. Web App\n8. Météo\n9. Changer Langue 🌍`,
    change_lang: "🌍 *Choisir la langue:*\n1. English\n2. Tswana\n3. French\n4. Nyanja\n5. Bemba",
    ussd_lang: "CON Choisir la langue:\n1. English\n2. Tswana\n3. French\n4. Nyanja\n5. Bemba",
    ussd_menu: "CON Bienvenue sur mARI Platform\n1. Dashboard\n2. Marché\n3. Crop Scan\n4. Ask mARI\n5. Finance\n6. Offre\n7. Web App\n8. Météo\n9. Changer Langue",
    thinking: "⏳ Analyse...",
    unknown: "❓ Option inconnue. Tapez *MENU*.",
  },
  ny: {
    welcome: (linked) => `🌱 *Takulandirani ku mARI Platform!*\n\n1. Dashboard\n2. Market\n3. Crop Scan 🔍\n4. Funzani mARI\n5. Finance\n6. Onjezani Malonda 📸\n7. Web App\n8. Weather\n9. Sinthani Chilankhulo 🌍`,
    change_lang: "🌍 *Sankhani Chilankhulo:*\n1. English\n2. Tswana\n3. French\n4. Nyanja\n5. Bemba",
    ussd_lang: "CON Sankhani Chilankhulo:\n1. English\n2. Tswana\n3. French\n4. Nyanja\n5. Bemba",
    ussd_menu: "CON Takulandirani ku mARI Platform\n1. Dashboard\n2. Market\n3. Crop Scan\n4. Funzani mARI\n5. Finance\n6. Malonda\n7. Web App\n8. Weather\n9. Sinthani",
    thinking: "⏳ Ndikuganiza...",
    unknown: "❓ Siziwika. Lembani *MENU*.",
  },
  be: {
    welcome: (linked) => `🌱 *Mwaiseni mu mARI Platform!*\n\n1. Dashboard\n2. Market\n3. Crop Scan 🔍\n4. Sipusheni mARI\n5. Finance\n6. Bikeni Malonda 📸\n7. Web App\n8. Weather\n9. Alyeni Ululimi 🌍`,
    change_lang: "🌍 *Saleni Ululimi:*\n1. English\n2. Tswana\n3. French\n4. Nyanja\n5. Bemba",
    ussd_lang: "CON Saleni Ululimi:\n1. English\n2. Tswana\n3. French\n4. Nyanja\n5. Bemba",
    ussd_menu: "CON Mwaiseni mu mARI Platform\n1. Dashboard\n2. Market\n3. Crop Scan\n4. Ask mARI\n5. Finance\n6. Malonda\n7. Web App\n8. Weather\n9. Ululimi",
    thinking: "⏳ Ndekutontonkanya...",
    unknown: "❓ Tafishibikwe. Lembani *MENU*.",
  }
};

export const getLang = (lang = 'en') => TRANSLATIONS[lang] || TRANSLATIONS['en'];
