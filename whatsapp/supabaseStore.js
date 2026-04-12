/**
 * whatsapp/supabaseStore.js
 *
 * Drop-in replacement for the in-memory sessions.js, backed by Supabase.
 * Tables required (run migrations/001_whatsapp.sql first):
 *   - whatsapp_sessions  (phone, state, linked, email, last_updated)
 *   - whatsapp_links     (phone, user_email, linked_at)
 *
 * Usage: swap the import in bot.js from './sessions.js' → './supabaseStore.js'
 */

import { getSupabaseClient } from '../src/lib/supabaseClient.js';

// ─── Session helpers ──────────────────────────────────────────────────────────

/**
 * Get session for a phone number. Creates a fresh row if none exists.
 */
export async function getSession(phone) {
  const cleanPhone = (phone || '').toString().replace(/\+/g, '').trim();
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('whatsapp_sessions')
    .select('*')
    .eq('phone', cleanPhone)
    .single();

  if (error || !data) {
    // Create new session
    const fresh = {
      phone: cleanPhone,
      state: 'WELCOME',
      linked: false,
      email: null,
      language: 'en',
      last_updated: new Date().toISOString(),
    };
    await supabase.from('whatsapp_sessions').upsert(fresh, { onConflict: 'phone' });
    return { ...fresh, history: [] };
  }

  return { ...data, history: data.history || [], language: data.language || 'en' };
}

/**
 * Update fields of an existing session.
 */
export async function updateSession(phone, patch) {
  const cleanPhone = (phone || '').toString().replace(/\+/g, '').trim();
  const supabase = getSupabaseClient();
  const update = { ...patch, last_updated: new Date().toISOString() };
  const { error } = await supabase
    .from('whatsapp_sessions')
    .update(update)
    .eq('phone', cleanPhone);

  if (error) console.error('[Supabase] updateSession error:', error.message);
}

/**
 * Reset a session back to WELCOME state.
 */
export async function resetSession(phone) {
  const cleanPhone = (phone || '').toString().replace(/\+/g, '').trim();
  const supabase = getSupabaseClient();
  await supabase
    .from('whatsapp_sessions')
    .update({
      state: 'WELCOME',
      linked: false,
      email: null,
      last_updated: new Date().toISOString(),
    })
    .eq('phone', cleanPhone);
}

// ─── WhatsApp link helpers ────────────────────────────────────────────────────

/**
 * Record that a WhatsApp number has been linked to an mARI Platform by Pameltex Tech email.
 */
export async function linkAccount(phone, email) {
  const cleanPhone = (phone || '').toString().replace(/\+/g, '').trim();
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('whatsapp_links').upsert(
    { phone: cleanPhone, user_email: email, linked_at: new Date().toISOString() },
    { onConflict: 'phone' }
  );
  if (error) console.error('[Supabase] linkAccount error:', error.message);
}

// ─── Message log helpers ──────────────────────────────────────────────────────

/**
 * Log an inbound or outbound WhatsApp message.
 * direction: 'inbound' | 'outbound'
 */
export async function logMessage({ phone, direction, body, channel = 'whatsapp', status = 'sent' }) {
  const cleanPhone = (phone || '').toString().replace(/\+/g, '').trim();
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('whatsapp_messages').insert({
    phone: cleanPhone,
    direction,
    body,
    channel,
    status,
    created_at: new Date().toISOString(),
  });
  if (error) console.error('[Supabase] logMessage error:', error.message);
}
