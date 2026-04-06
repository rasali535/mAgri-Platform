import { createClient } from '@supabase/supabase-js';

let _client = null;

/**
 * Returns a lazily-initialised Supabase client.
 * The client is created on first call so that environment variables are
 * guaranteed to be available at runtime (not during module load / build).
 */
export function getSupabaseClient() {
  if (_client) return _client;

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      '[Supabase] CRITICAL: SUPABASE_URL / VITE_SUPABASE_URL and ' +
      'SUPABASE_SERVICE_KEY / VITE_SUPABASE_ANON_KEY must be set in the environment.'
    );
  }

  _client = createClient(supabaseUrl, supabaseKey);
  return _client;
}
