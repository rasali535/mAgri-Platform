/**
 * whatsapp/imageUploader.js
 *
 * Fetches a media file from Meta's temporary URL and streams it
 * directly into a Supabase Storage bucket — no local disk writes.
 *
 * Flow:
 *   1. Resolve media_id → temporary download URL via Meta Graph API
 *   2. Download the image as a Buffer
 *   3. Upload Buffer to Supabase Storage (bucket: crop-images)
 *   4. Return the public URL
 */

import { createClient } from '@supabase/supabase-js';

const BUCKET = 'crop-images';
const META_API_VER = 'v18.0';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Resolve a Meta media_id to its temporary download URL.
 * @param {string} mediaId
 * @returns {Promise<{url: string, mimeType: string}>}
 */
async function resolveMetaMediaUrl(mediaId) {
  const token = process.env.META_WHATSAPP_TOKEN;
  const resp = await fetch(
    `https://graph.facebook.com/${META_API_VER}/${mediaId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Meta media lookup failed (${resp.status}): ${err}`);
  }
  const data = await resp.json();
  return { url: data.url, mimeType: data.mime_type || 'image/jpeg' };
}

/**
 * Download the image bytes from Meta's temporary signed URL.
 * @param {string} url
 * @returns {Promise<Buffer>}
 */
async function downloadMetaMedia(url) {
  const token = process.env.META_WHATSAPP_TOKEN;
  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error(`Media download failed (${resp.status})`);
  const arrayBuf = await resp.arrayBuffer();
  return Buffer.from(arrayBuf);
}

/**
 * Main export: given a Meta media_id, upload to Supabase and return public URL.
 * @param {string} mediaId  – from Meta webhook message.image.id
 * @param {string} phone    – farmer's phone (used to organise storage path)
 * @returns {Promise<string>} public URL of the uploaded image
 */
export async function uploadMediaToSupabase(mediaId, phone) {
  // 1. Resolve temporary URL
  const { url, mimeType } = await resolveMetaMediaUrl(mediaId);

  // 2. Download the image
  const buffer = await downloadMetaMedia(url);

  // 3. Build a unique storage path
  const ext = mimeType.split('/')[1] || 'jpg';
  const timestamp = Date.now();
  const safeName = phone.replace(/[^0-9]/g, '');
  const storagePath = `listings/${safeName}/${timestamp}.${ext}`;

  // 4. Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Supabase upload failed: ${uploadError.message}`);
  }

  // 5. Retrieve public URL
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  if (!data?.publicUrl) throw new Error('Could not retrieve public URL from Supabase');

  return data.publicUrl;
}
