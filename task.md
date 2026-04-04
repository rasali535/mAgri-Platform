# mAgri Platform — Task List

## ✅ Completed (Previous Sprint)
- [x] Abort Supabase Edge Functions migration.
- [x] Create `render.yaml` configuration for Render deploy.
- [x] Push code to GitHub (`git add .`, `git commit`, `git push`).
- [x] Connect the GitHub repository to Render (https://dashboard.render.com/select-repo).
- [x] In Render settings, add the Environment Variables from `.env`.
- [x] Update Africa's Talking USSD and WhatsApp callbacks to Render URL.

## ✅ Completed (Farmer Marketplace Sprint)
- [x] Add required environment variables to `.env` (`SUPABASE_SERVICE_KEY`, `SUPABASE_KEY`).
- [x] Remove `VITE_OPENAI_API_KEY` from `.env`.
- [x] `@supabase/supabase-js` already installed — no action needed.
- [x] Create `src/lib/supabaseClient.js` — shared Supabase client (service role).
- [x] Create `whatsapp/imageUploader.js` — fetch Meta image by `media_id` → upload to Supabase Storage (no local disk writes).
- [x] Create `whatsapp/listingsStore.js` — Supabase CRUD helpers for `listings` table.
- [x] Update `whatsapp/bot.js` — swap in-memory sessions → Supabase; add `UPLOAD_PENDING` state; add option 7 (Add a Crop Listing).
- [x] Update `whatsapp/menu.js` — add `7️⃣ Add a Crop Listing 📸` to WELCOME menu.
- [x] Update `index.js` Meta webhook — route image messages to `processImage()`, text to `processWhatsApp()`.
- [x] Apply `listings` table migration to Supabase (with RLS policy).
- [x] Create `crop-images` Supabase Storage bucket (public).
- [x] Add Storage RLS policies (public read, service role write).

## ⏳ Remaining
- [ ] Add all env vars to **Render Dashboard** → service → Environment Variables:
  - `SUPABASE_SERVICE_KEY`
  - `SUPABASE_KEY`
  - `VITE_SUPABASE_URL`
  - `META_WHATSAPP_TOKEN`
  - `META_WHATSAPP_PHONE_ID`
  - `META_WEBHOOK_VERIFY_TOKEN`
  - `AT_API_KEY`, `AT_USERNAME`
  - `WEBAPP_URL`
- [ ] Push latest code to GitHub to trigger Render redeploy.
- [ ] Verify Meta Webhook URL is set to `https://<render-url>/api/whatsapp/meta`.
- [ ] Send a test WhatsApp message with an image and confirm listing appears in Supabase `listings` table.
- [ ] Confirm confirmation message with listing URL is sent back to farmer.
