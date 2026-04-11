/**
 * whatsapp/listingsStore.js
 *
 * Supabase-backed helpers for the crop listings table.
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Insert a new listing row after a successful image upload.
 * @param {string} phone      – farmer's E.164 phone number
 * @param {string} imageUrl   – public Supabase Storage URL
 * @param {string} [cropName] – optional crop name
 * @returns {Promise<object>} inserted row
 */
export async function createListing(phone, imageUrl, cropName = null) {
  const { data, error } = await supabase
    .from('listings')
    .insert({ phone, image_url: imageUrl, crop_name: cropName })
    .select()
    .single();

  if (error) throw new Error(`listings insert failed: ${error.message}`);
  return data;
}

/**
 * Fetch the N most recent active listings.
 * @param {number} limit
 * @returns {Promise<object[]>}
 */
export async function getRecentListings(limit = 10) {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`listings fetch failed: ${error.message}`);
  return data || [];
}

/**
 * Search active listings by crop name.
 * @param {string} query
 * @param {number} limit
 * @returns {Promise<object[]>}
 */
export async function searchListings(query, limit = 10) {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .ilike('crop_name', `%${query}%`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`listings search failed: ${error.message}`);
  return data || [];
}
