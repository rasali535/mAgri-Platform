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
 * Insert a new listing row.
 * @param {object} params – { phone, imageUrl, cropName, type, description, quantity, price, location, country, region, district }
 * @returns {Promise<object>} inserted row
 */
export async function createListing({ 
  phone, imageUrl, cropName, type = 'sell', 
  description = '', quantity = '', price = null, 
  location = '', country = '', region = '', district = '' 
}) {
  const { data, error } = await supabase
    .from('listings')
    .insert({ 
      phone, 
      image_url: imageUrl, 
      crop_name: cropName, 
      type, 
      description, 
      quantity, 
      price, 
      location, 
      country, 
      region, 
      district 
    })
    .select()
    .single();

  if (error) {
    console.error('Listings insert error:', error);
    throw new Error(`listings insert failed: ${error.message}`);
  }
  return data;
}

/**
 * Fetch recent active listings with optional type filter.
 * @param {number} limit
 * @param {string} type – 'sell' | 'buy' | 'all'
 * @returns {Promise<object[]>}
 */
export async function getRecentListings(limit = 10, type = 'all') {
  let query = supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (type !== 'all') {
    query = query.eq('type', type);
  }

  const { data, error } = await query;
  if (error) throw new Error(`listings fetch failed: ${error.message}`);
  return data || [];
}

/**
 * Search active listings by crop name with optional type filter.
 * @param {string} searchTerm
 * @param {number} limit
 * @param {string} type – 'sell' | 'buy' | 'all'
 * @returns {Promise<object[]>}
 */
export async function searchListings(searchTerm, limit = 10, type = 'all') {
  let query = supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .ilike('crop_name', `%${searchTerm}%`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (type !== 'all') {
    query = query.eq('type', type);
  }

  const { data, error } = await query;
  if (error) throw new Error(`listings search failed: ${error.message}`);
  return data || [];
}
