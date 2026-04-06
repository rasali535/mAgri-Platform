/**
 * whatsapp/translations.js
 * Centralized localization dictionary.
 * 
 * Supported: en, tn (Tswana), fr (French), ny (Nyanja), be (Bemba)
 */

export const TRANSLATIONS = {
  en: {
    welcome: (linked) => `🌱 *Welcome to mAgri!*\n` +
      (linked ? `` : `\n⚠️ Number not linked. Send *LINK* to connect.\n`) +
      `\n1. Dashboard\n2. Market\n3. Crop Scan 🔍\n4. Ask mARI\n5. Finance\n6. Add Listing 📸\n7. Web App\n8. Weather\n9. Change Language 🌍\n\nReply with a number or *MENU*.`,
    change_lang: "🌍 *Select Language:*\n1. English\n2. Tswana\n3. French\n4. Nyanja\n5. Bemba\n\nType *CANCEL* to go back.",
    ussd_lang: "CON Select Language:\n1. English\n2. Tswana\n3. French\n4. Nyanja\n5. Bemba",
    thinking: "⏳ Thinking...",
    unknown: "❓ Unknown option. Type *MENU*.",
  },
  tn: {
    welcome: (linked) => `🌱 *Amogela mo mAgri!*\n\n1. Tesheboto\n2. Marekelo\n3. Crop Scan 🔍\n4. Botsa mARI\n5. Madi\n6. Tsenya Phahlo 📸\n7. Web App\n8. Weather\n9. Fetola Puo 🌍`,
    change_lang: "🌍 *Tlhopha Puo:*\n1. English\n2. Tswana\n3. French\n4. Nyanja\n5. Bemba",
    ussd_lang: "CON Tlhopha Puo:\n1. English\n2. Tswana\n3. French\n4. Nyanja\n5. Bemba",
    thinking: "⏳ Ke a akanya...",
    unknown: "❓ Ga ke utlwe. Thapa *MENU*.",
  },
  fr: {
    welcome: (linked) => `🌱 *Bienvenue sur mAgri!*\n\n1. Tableau de bord\n2. Marché\n3. Scanner Culture 🔍\n4. Demander à mARI\n5. Finance\n6. Ajouter Offre 📸\n7. Web App\n8. Météo\n9. Changer Langue 🌍`,
    change_lang: "🌍 *Choisir la langue:*\n1. English\n2. Tswana\n3. French\n4. Nyanja\n5. Bemba",
    ussd_lang: "CON Choisir la langue:\n1. English\n2. Tswana\n3. French\n4. Nyanja\n5. Bemba",
    thinking: "⏳ Analyse...",
    unknown: "❓ Option inconnue. Tapez *MENU*.",
  },
  ny: {
    welcome: (linked) => `🌱 *Takulandirani ku mAgri!*\n\n1. Dashboard\n2. Market\n3. Crop Scan 🔍\n4. Funzani mARI\n5. Finance\n6. Onjezani Malonda 📸\n7. Web App\n8. Weather\n9. Sinthani Chilankhulo 🌍`,
    change_lang: "🌍 *Sankhani Chilankhulo:*\n1. English\n2. Tswana\n3. French\n4. Nyanja\n5. Bemba",
    ussd_lang: "CON Sankhani Chilankhulo:\n1. English\n2. Tswana\n3. French\n4. Nyanja\n5. Bemba",
    thinking: "⏳ Ndikuganiza...",
    unknown: "❓ Siziwika. Lembani *MENU*.",
  },
  be: {
    welcome: (linked) => `🌱 *Mwaiseni mu mAgri!*\n\n1. Dashboard\n2. Market\n3. Crop Scan 🔍\n4. Sipusheni mARI\n5. Finance\n6. Bikeni Malonda 📸\n7. Web App\n8. Weather\n9. Alyeni Ululimi 🌍`,
    change_lang: "🌍 *Saleni Ululimi:*\n1. English\n2. Tswana\n3. French\n4. Nyanja\n5. Bemba",
    ussd_lang: "CON Saleni Ululimi:\n1. English\n2. Tswana\n3. French\n4. Nyanja\n5. Bemba",
    thinking: "⏳ Ndekutontonkanya...",
    unknown: "❓ Tafishibikwe. Lembani *MENU*.",
  }
};

export const getLang = (lang = 'en') => TRANSLATIONS[lang] || TRANSLATIONS['en'];
