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

import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { getSupabaseClient } from '../src/lib/supabaseClient.js';

const BUCKET = 'farmer-uploads';
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
 * Upload an image from Baileys to Supabase and return public URL.
 * @param {object} messageContent  – The actual message.imageMessage object
 * @param {string} phone    – farmer's phone (used to organise storage path)
 * @returns {Promise<string>} public URL of the uploaded image
 */
export async function uploadMediaToSupabase(messageContent, phone) {
  const supabase = getSupabaseClient();
  // 1. Download the image using Baileys
  const stream = await downloadContentFromMessage(messageContent, 'image');
  let buffer = Buffer.from([]);
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }

  // 2. Build a unique storage path
  const mimeType = messageContent.mimetype || 'image/jpeg';
  const ext = mimeType.split('/')[1] || 'jpg';
  const timestamp = Date.now();
  const safeName = phone.replace(/[^0-9]/g, '');
  const storagePath = `listings/${safeName}/${timestamp}.${ext}`;

  // 3. Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Supabase upload failed: ${uploadError.message}`);
  }

  // 4. Retrieve public URL
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  if (!data?.publicUrl) throw new Error('Could not retrieve public URL from Supabase');

  return data.publicUrl;
}
