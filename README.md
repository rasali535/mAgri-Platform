

# mARI Platform

The mARI Platform connects smallholder farmers to markets, finance, weather, and expert agronomists — accessible on the **web** and through **WhatsApp**.

---

## Run Locally

**Prerequisites:** Node.js ≥ 20

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

3. Run the dev server (Vite frontend):
   ```bash
   npm run dev
   ```

4. Run the Node backend (Express + WhatsApp bot):
   ```bash
   node index.js
   ```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AT_API_KEY` | ✅ | Africa's Talking API key |
| `AT_USERNAME` | ✅ | Africa's Talking username (`sandbox` for testing) |
| `WEBAPP_URL` | ✅ | Public URL of this platform (sent in WhatsApp messages) |
| `VITE_GEMINI_API_KEY` | ✅ | Google Gemini API key (for Luna AI chat) |
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anon/publishable key |
| `DATABASE_URL` | ✅ | PostgreSQL connection string (Supabase) |
| `VITE_OPENAI_API_KEY` | Optional | OpenAI key (if using GPT models) |

---

## WhatsApp Conversational Menu (via Africa's Talking)

Users can interact with the full mAgri platform directly through WhatsApp.

### Features accessible via WhatsApp

| Option | Feature |
|--------|---------|
| 1️⃣ | **Marketplace** — browse/search live produce listings |
| 2️⃣ | **My Orders** — view order status |
| 3️⃣ | **Credit & Finance** — check score, apply for micro-credit |
| 4️⃣ | **Weather Forecast** — 3-day local forecast |
| 5️⃣ | **Ask an Agronomist** — submit a farming question |
| 6️⃣ | **Open Web App** — receive a direct link |

Universal commands work from any state:
- `MENU` / `HI` / `HELLO` — return to main menu
- `LINK` — link your WhatsApp number to your mAgri account
- `CANCEL` — go back

### Bot Architecture

```
Africa's Talking (WhatsApp)
        │
        ▼ POST /api/whatsapp/webhook
   index.js (Express)
        │
        ▼
   whatsapp/bot.js       ← FSM state machine
        │
        ├── whatsapp/sessions.js   ← in-memory session store
        ├── whatsapp/menu.js       ← all reply text
        └── whatsapp/africa.js     ← sendSMS / sendWhatsApp
```

### Setup

1. **Create an Africa's Talking account** at [africastalking.com](https://africastalking.com)
2. Enable the **WhatsApp channel** in your dashboard
3. Set the **Callback URL** to:
   ```
   https://navajowhite-monkey-252201.hostingersite.com/api/whatsapp/webhook
   ```
4. For local testing, use [ngrok](https://ngrok.com):
   ```bash
   ngrok http 3000
   # Copy the HTTPS URL → paste into AT dashboard as Callback URL
   ```
5. Run the server:
   ```bash
   node index.js
   ```
6. Send a message from WhatsApp to your AT sandbox number to begin.

### Supabase Tables (optional — for persistent sessions)

Run `migrations/001_whatsapp.sql` in the Supabase SQL editor to create:
- `whatsapp_sessions` — conversation state per phone number
- `whatsapp_links` — maps WhatsApp phone to mAgri account email
- `whatsapp_messages` — full audit log of inbound/outbound messages

Then swap the import in `whatsapp/bot.js`:
```js
// From:
import { getSession, updateSession, resetSession } from './sessions.js';
// To:
import { getSession, updateSession, resetSession } from './supabaseStore.js';
```

### Server-Initiated Notifications

Send a WhatsApp message programmatically from any part of the backend:

```js
// Raw message
POST /api/whatsapp/send
{ "to": "+254712345678", "message": "Your listing has been approved!" }

// Order confirmation
POST /api/whatsapp/send
{ "to": "+254712345678", "type": "order", "payload": { "id": "ORD-001", "produce": "Maize", "qty": "5kg", "seller": "Grace" } }

// Credit application received
POST /api/whatsapp/send
{ "to": "+254712345678", "type": "credit-apply", "payload": { "amount": "5000", "currency": "KES " } }

// SMS fallback
POST /api/whatsapp/send
{ "to": "+254712345678", "message": "...", "channel": "sms" }
```

---

## Running Tests

```bash
# Install Jest (if not already installed)
npm i -D jest

# Run bot unit tests
npx jest tests/whatsappBot.test.js

# Manual conversation simulation (no network calls)
node scripts/whatsappBotTest.js
```

---

## Project Structure

```
mAgri-Platform/
├── index.js               # Express server (entry point)
├── src/                   # React + Vite frontend
│   └── components/        # UI components (Marketplace, Finance, etc.)
├── whatsapp/
│   ├── africa.js          # Africa's Talking REST wrapper (SMS + WhatsApp)
│   ├── bot.js             # WhatsApp FSM bot logic
│   ├── menu.js            # Menu text definitions
│   ├── notify.js          # Server-initiated notification helpers
│   ├── sessions.js        # In-memory session store
│   └── supabaseStore.js   # Supabase-backed session store (production)
├── migrations/
│   └── 001_whatsapp.sql   # DB migration for WhatsApp tables
├── scripts/
│   └── whatsappBotTest.js # Manual conversation simulation
└── tests/
    └── whatsappBot.test.js # Jest unit tests
```
