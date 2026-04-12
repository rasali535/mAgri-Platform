/**
 * whatsapp/translations.js
 * Centralized localization dictionary for the mARI platform.
 * 
 * Supported: en, tn (Setswana), fr (French), ny (Nyanja), be (Bemba)
 */

export const TRANSLATIONS = {
  en: {
    welcome: (linked, name) => `🌱 *Welcome ${name ? name + ' ' : ''}to mARI Platform by Pameltex Tech!* \n\n` +
      (linked ? `` : `⚠️ Your WhatsApp number is not linked yet. Send *LINK* to connect your account.\n\n`) +
      `Please choose an option:\n` +
      `1️⃣  Dashboard\n` +
      `2️⃣  Marketplace\n` +
      `3️⃣  Crop Scan (mARI AI) 🔍\n` +
      `4️⃣  Ask mARI (AI Advisor)\n` +
      `5️⃣  Finance & Credit\n` +
      `6️⃣  Weather Forecast\n` +
      `7️⃣  Farmer Community\n` +
      `8️⃣  Vuka Social Network 👥\n` +
      `9️⃣  Language Settings 🌍\n` +
      `🔟  Mpotsa Q&A Engine 📚\n` +
      `1️⃣1️⃣ Subscription 💳\n\n` +
      `Reply with a number or type *MENU* anytime.\n\n` +
      `📅 _Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}_`,
    
    ussd_menu: "mARI Platform by Pameltex Tech\n1. Dashboard\n2. Marketplace\n3. Crop Scan\n4. Ask mARI\n5. Finance\n6. Weather\n7. Community\n8. Vuka Social\n9. Language\n10. Mpotsa Q&A\n11. Subscription",
    
    dashboard: (p, s, st) => `📦 *mARI Dashboard*\n\n👤 *User:* ${p.name} (${p.role})\n📍 *Loc:* ${p.location}\n💳 *Status:* ${s.active ? '✅ ACTIVE' : '❌ INACTIVE'}\n🔬 *Scans:* ${st.scans}\n👥 *Vuka Friends:* ${p.friendsCount}`,
    
    marketplace_menu: "🛒 *Marketplace*\n1. Recent Listings\n2. Search Crops\n\n0. Back",
    marketplace_prompt: "Enter crop name to search:",
    marketplace_results: (text) => `🛒 *Marketplace Search*\nResults for "${text}":`,
    marketplace_no_results: "No active listings found for your search.",
    
    credit_menu: "💳 *Finance & Credit*\n1. Credit Score\n2. Apply for Loan\n3. Insurance\n\n0. Back",
    credit_score: (score) => `📊 Your Credit Score is *${score}* (Excellent).\n\nReply 0 to go back.`,
    credit_apply_ok: (amount) => `✅ Your application for *${amount}* credit has been received! Our team will review and reply via SMS.`,
    
    vuka_menu: "👥 *Vuka Social Network*\n1. My Profile\n2. Social Feed\n3. Create Post\n4. Group Chats\n5. Find Friends\n\n0. Back",
    vuka_profile: (u, fCount) => `👤 *Vuka Profile*\nName: ${u.name}\nRole: ${u.role}\nFriends: ${fCount}\n\n*Options:*\n2. Social Feed\n3. Create Post\n0. Back`,
    vuka_register_prompt: "👤 *Vuka Profile*\nYou are not registered yet.\n\nReply with your *Name* to create one:",
    vuka_search_prompt: "🔍 *Find Friends*\nEnter a name or phone number to search:",
    vuka_post_prompt: "📝 *Create Post*\nType what's on your mind:",
    
    mpotsa_prompt: "📚 *Mpotsa Universal Q&A*\nAsk any question (Farming, Health, Legal, Jobs):",
    
    change_lang: "🌍 *Select Language:*\n1. English\n2. Setswana\n3. French\n4. Nyanja\n5. Bemba\n\nType *CANCEL* to go back.",
    thinking: "⏳ thinking...",
    unknown: "❓ Unknown option. Type *MENU*.",
    await_link: "📧 Please send your email to link your account. Type *CANCEL* to go back.",
    linked_ok: (email) => `✅ Linked to *${email}*. Type *MENU* to return.`,
    diagnose_prompt: "🔍 *Crop Scan*\nPlease send a photo of your plant for mARI to analyze.",
    agronomist_prompt: "🧑‍🌾 *Ask mARI AI Advisor*\nType your farming question below.",
    
    weather_info: "🌦 *Weather Forecast*\nSunny with light showers. Good for your crops!",
    community_info: (url) => `💬 *Community*\nJoin our 5,000+ member farmer forum here: ${url}`,
    subscription_info: "💳 *Subscription*\nVisit the web app or dial USSD (*384*14032#) to manage your subscription.",
    
    cancel_exit: "Type *CANCEL* or *0* to go back.",
    back_menu: "Type *MENU* to return."
  },
  tn: {
    welcome: (linked, name) => `🌱 *Mogala wa mARI Platform by Pameltex Tech!* ${name ? name : ''}\n\n1. Dashboard\n2. Marekelo\n3. Crop Scan 🔍\n4. Ask mARI (Advisor)\n5. Finance\n6. Weather\n7. Community\n8. Vuka Social 👥\n9. Language 🌍\n10. Mpotsa Q&A\n11. Subscription 💳`,
    ussd_menu: "mARI Platform by Pameltex Tech\n1. Dashboard\n2. Marekelo\n3. Crop Scan\n4. Ask mARI\n5. Finance\n6. Weather\n7. Community\n8. Vuka Social\n9. Language\n10. Mpotsa Q&A\n11. Subscription",
    dashboard: (p, s, st) => `📦 *mARI Dashboard*\n\n👤 *User:* ${p.name}\n📍 *Lefelo:* ${p.location}\n💳 *Status:* ${s.active ? '✅ ACTIVE' : '❌ INACTIVE'}`,
    marketplace_menu: "🛒 *Marekelo*\n1. Di-listing tsa bosheng\n2. Batla dijalo\n\n0. Back",
    marketplace_prompt: "Kwala leina la sejalwa:",
    marketplace_results: (text) => `🛒 *Dipatlisiso tsa Marekelo*\nDipadi tsa "${text}":`,
    marketplace_no_results: "Ga go a bonwa sepe se o se batlang.",
    credit_menu: "💳 *Finance*\n1. Credit Score\n2. Kopa Kadimo\n3. Insurance\n\n0. Back",
    credit_score: (score) => `📊 Credit Score ya gago ke *${score}*.`,
    vuka_menu: "👥 *Vuka Social*\n1. Profile ya me\n2. Social Feed\n5. Batla ditsala\n\n0. Back",
    vuka_register_prompt: "👤 *Vuka Profile*\nGa o a ikwadisetsa.\n\nKwala leina la gago:",
    vuka_search_prompt: "🔍 *Batla ditsala*\nKwala leina kgotsa nomore ya mogala:",
    mpotsa_prompt: "📚 *Mpotsa Q&A*\nBotsa potso efe kapa efe:",
    change_lang: "🌍 *Tlhopha Puo:*\n1. English\n2. Setswana\n3. French\n4. Nyanja\n5. Bemba",
    agronomist_prompt: "🧑‍🌾 *Motsamaisa AI*\nKwala potso ya gago ya temo fa tlase.",
    weather_info: "🌦 *Tebelopele ya bosa*\nGo tla bo go le letsatsi le pula e potlana.",
    community_info: (url) => `💬 *Lekgotla*\nTsena mo forum ya rona ya balemi ba ba fetang 5,000 fa: ${url}`,
    subscription_info: "💳 *Subscription*\nEtela web app kgotsa letsetsa USSD go laola subscription ya gago.",
    vuka_post_prompt: "📝 *Kwala Sentele*\nKwala se o se akanyang:",
    thinking: "⏳ Ke a akanya...",
    unknown: "❓ Ga ke utlwe. Type *MENU*.",
  },
  fr: {
    welcome: (linked, name) => `🌱 *Bienvenue sur mARI Platform by Pameltex Tech!* ${name ? name : ''}\n\n1. Tableau de bord\n2. Marché\n3. Scanner Culture 🔍\n4. Ask mARI (Conseiller)\n5. Finance\n6. Météo\n7. Communauté\n8. Réseau Vuka 👥\n9. Language 🌍\n10. Mpotsa Q&A\n11. Subscription 💳`,
    ussd_menu: "mARI Platform by Pameltex Tech\n1. Tableau de bord\n2. Marché\n3. Crop Scan\n4. Ask mARI\n5. Finance\n6. Météo\n7. Communauté\n8. Réseau Vuka\n9. Language\n10. Mpotsa Q&A\n11. Subscription",
    dashboard: (p, s, st) => `📦 *Tableau de bord*\n\n👤 *Utilisateur:* ${p.name}\n💳 *Statut:* ${s.active ? '✅ ACTIF' : '❌ INACTIF'}`,
    marketplace_menu: "🛒 *Marché*\n1. Annonces récentes\n2. Rechercher\n\n0. Retour",
    marketplace_prompt: "Entrez le nom de la culture:",
    marketplace_results: (text) => `🛒 *Recherche au Marché*\nRésultats pour "${text}":`,
    marketplace_no_results: "Aucune annonce trouvée pour votre recherche.",
    credit_menu: "💳 *Finance*\n1. Score de crédit\n2. Demander un prêt\n3. Assurance\n\n0. Retour",
    vuka_menu: "👥 *Réseau Vuka*\n1. Mon Profil\n2. Flux Social\n5. Trouver des amis\n\n0. Retour",
    vuka_register_prompt: "👤 *Profil Vuka*\nVous n'êtes pas inscrit.\n\nEntrez votre nom:",
    vuka_search_prompt: "🔍 *Trouver des amis*\nEntrez un nom ou un numéro:",
    mpotsa_prompt: "📚 *Mpotsa Q&A*\nPosez une question:",
    change_lang: "🌍 *Choisir la langue:*\n1. English\n2. Setswana\n3. French\n4. Nyanja\n5. Bemba",
    agronomist_prompt: "🧑‍🌾 *Conseiller mARI AI*\nPosez votre question sur l'agriculture ci-dessous.",
    weather_info: "🌦 *Prévisions météo*\nEnsoleillé avec de légères averses.",
    community_info: (url) => `💬 *Communauté*\nRejoignez notre forum de 5 000+ agriculteurs ici: ${url}`,
    subscription_info: "💳 *Abonnement*\nVisitez l'application web ou composez l'USSD pour gérer votre abonnement.",
    vuka_post_prompt: "📝 *Créer un message*\nÉcrivez ce que vous pensez:",
    thinking: "⏳ Analyse...",
    unknown: "❓ Option inconnue. Tapez *MENU*.",
  },
  ny: {
    welcome: (linked, name) => `🌱 *Takulandirani ku mARI Platform by Pameltex Tech!* ${name ? name : ''}\n\n1. Dashboard\n2. Malonda\n3. Crop Scan 🔍\n4. Funzani mARI (Advisor)\n5. Finance\n6. Weather\n7. Community\n8. Vuka Social 👥\n9. Language 🌍\n10. Mpotsa Q&A\n11. Subscription 💳`,
    ussd_menu: "mARI Platform by Pameltex Tech\n1. Dashboard\n2. Malonda\n3. Crop Scan\n4. Ask mARI\n5. Finance\n6. Weather\n7. Community\n8. Vuka Social\n9. Language\n10. Mpotsa Q&A\n11. Subscription",
    dashboard: (p, s, st) => `📦 *mARI Dashboard*\n\n👤 *User:* ${p.name}\n💳 *Status:* ${s.active ? '✅ ACTIVE' : '❌ INACTIVE'}`,
    marketplace_menu: "🛒 *Malonda*\n1. Zatsopano\n2. Sakuwa\n\n0. Back",
    marketplace_prompt: "Lembani dzina la mbewu:",
    marketplace_results: (text) => `🛒 *Kufufuza ku Malonda*\nZotsatira za "${text}":`,
    marketplace_no_results: "Palibe malonda omwe apezeka pakufufuza kwanu.",
    credit_menu: "💳 *Finance*\n1. Credit Score\n2. Kopa Ngongole\n\n0. Back",
    vuka_menu: "👥 *Vuka Social*\n1. Profile yanga\n2. Zatsopano\n5. Pezani anzanu\n\n0. Back",
    vuka_register_prompt: "👤 *Vuka Profile*\nMunakalembetse.\n\nLembani dzina lanu:",
    vuka_search_prompt: "🔍 *Pezani anzanu*\nLembani dzina kapena nambala:",
    mpotsa_prompt: "📚 *Mpotsa Q&A*\nFunzani funso lililonse:",
    change_lang: "🌍 *Sankhani Chilankhulo:*\n1. English\n2. Setswana\n3. French\n4. Nyanja\n5. Bemba",
    agronomist_prompt: "🧑‍🌾 *Mulangizi wa mARI AI*\nLembani funso lanu lazachulimi m'munsimu.",
    weather_info: "🌦 *Zanyengo*\nKutentha ndi mvula pang'ono.",
    community_info: (url) => `💬 *Gulu*\nlowani mu forum yathu ya alimi 5,000+ apa: ${url}`,
    subscription_info: "💳 *Kulembetsa*\nPitani pa web app kapena imbani USSD kuti mufotokoze kulembetsa kwanu.",
    vuka_post_prompt: "📝 *Lembani Uthenga*\nLembani zomwe mukuganiza:",
    thinking: "⏳ Ndikuganiza...",
    unknown: "❓ Siziwika. Lembani *MENU*.",
  },
  be: {
    welcome: (linked, name) => `🌱 *Mwaiseni mu mARI Platform by Pameltex Tech!* ${name ? name : ''}\n\n1. Dashboard\n2. Market\n3. Crop Scan 🔍\n4. Sipusheni mARI (Advisor)\n5. Finance\n6. Weather\n7. Community\n8. Vuka Social 👥\n9. Language 🌍\n10. Mpotsa Q&A\n11. Subscription 💳`,
    ussd_menu: "mARI Platform by Pameltex Tech\n1. Dashboard\n2. Market\n3. Crop Scan\n4. Ask mARI\n5. Finance\n6. Weather\n7. Community\n8. Vuka Social\n9. Language\n10. Mpotsa Q&A\n11. Subscription",
    dashboard: (p, s, st) => `📦 *mARI Dashboard*\n\n👤 *User:* ${p.name}\n💳 *Status:* ${s.active ? '✅ ACTIVE' : '❌ INACTIVE'}`,
    marketplace_menu: "🛒 *Market*\n1. Ifipatikwa nomba\n2. Fwaya\n\n0. Back",
    marketplace_prompt: "Lembani ishina lya mushi:",
    marketplace_results: (text) => `🛒 *Ukufwaya mu Market*\nIfyasangilwe pa "${text}":`,
    marketplace_no_results: "Tapali ifipatikwa ifyasangilwe pa kufwaya kwenu.",
    credit_menu: "💳 *Finance*\n1. Credit Score\n2. Kopa Ngongole\n\n0. Back",
    vuka_menu: "👥 *Vuka Social*\n1. Profile yandi\n2. Social Feed\n5. Isulo ifibusa\n\n0. Back",
    vuka_register_prompt: "👤 *Vuka Profile*\nTafilumbulwa.\n\nLembani ishina lyenu:",
    vuka_search_prompt: "🔍 *Isulo ifibusa*\nLembani ishina nangu nambala:",
    mpotsa_prompt: "📚 *Mpotsa Q&A*\nIpusheni amepusho:",
    change_lang: "🌍 *Saleni Ululimi:*\n1. English\n2. Setswana\n3. French\n4. Nyanja\n5. Bemba",
    agronomist_prompt: "🧑‍🌾 *Kawonwa wa mARI AI*\nLembani icipusho cenu pabulaimi.",
    weather_info: "🌦 *Ifya Mulu*\nAkasuba ne mfula panono.",
    community_info: (url) => `💬 *Ibumba*\nIngileni mwi bumba lya balimi 5,000+ apa: ${url}`,
    subscription_info: "💳 *Ukulembesha*\nPyungileni pa web app nangu USSD ukulonganya ukulembesha kwenu.",
    vuka_post_prompt: "📝 *Lembani Icifumununa*\nLembani ifyo muletonkanya:",
    thinking: "⏳ Ndekutontonkanya...",
    unknown: "❓ Tafishibikwe. Lembani *MENU*.",
  }
};

export const getLang = (lang = 'en') => TRANSLATIONS[lang] || TRANSLATIONS['en'];
