import { initAuthCreds, BufferJSON, proto } from '@whiskeysockets/baileys';
import { supabase } from '../src/lib/supabaseClient.js';

/**
 * Custom authentication state provider for Baileys that persists data in Supabase.
 * This allows the bot to maintain session across restarts on ephemeral filesystems like Railway.
 * 
 * Target Table: wa_auth (or wa_sessions)
 * Columns Required: id (text, primary key), data (jsonb)
 */
export const useSupabaseAuthState = async (sessionName = 'primary') => {
    // Prefix keys to allow multiple sessions or instances to coexist in the same table
    const getKey = (id) => `${sessionName}:${id}`;

    /**
     * Reads a single record from Supabase and parses it using Baileys' BufferJSON.reviver
     */
    const readData = async (id) => {
        try {
            const key = getKey(id);
            const { data, error } = await supabase
                .from('wa_auth') // Replace with 'wa_sessions' if preferred
                .select('data')
                .eq('id', key)
                .single();

            if (error || !data) {
                return null;
            }
            // Baileys requires specific deserialization for Buffers/Protos
            return JSON.parse(JSON.stringify(data.data), BufferJSON.reviver);
        } catch (err) {
            console.error(`[Auth] Error reading ${id}:`, err);
            return null;
        }
    };

    /**
     * Writes or Updates a record in Supabase using Baileys' BufferJSON.replacer
     */
    const writeData = async (data, id) => {
        try {
            const key = getKey(id);
            const json = JSON.parse(JSON.stringify(data, BufferJSON.replacer));
            const { error } = await supabase
                .from('wa_auth')
                .upsert({ id: key, data: json });

            if (error) throw error;
        } catch (err) {
            console.error(`[Auth] Error writing ${id}:`, err);
        }
    };

    /**
     * Deletes a record from Supabase
     */
    const removeData = async (id) => {
        try {
            const key = getKey(id);
            await supabase
                .from('wa_auth')
                .delete()
                .eq('id', key);
        } catch (err) {
            console.error(`[Auth] Error removing ${id}:`, err);
        }
    };

    // Load credentials from database
    let creds = await readData('creds');
    if (!creds) {
        console.log('[Auth] Initializing new credentials');
        creds = initAuthCreds();
        await writeData(creds, 'creds');
    }

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(
                        ids.map(async (id) => {
                            let value = await readData(`${type}-${id}`);
                            if (type === 'app-state-sync-key' && value) {
                                value = proto.Message.AppStateSyncKeyData.fromObject(value);
                            }
                            data[id] = value;
                        })
                    );
                    return data;
                },
                set: async (data) => {
                    const tasks = [];
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const key = `${category}-${id}`;
                            if (value) {
                                tasks.push(writeData(value, key));
                            } else {
                                tasks.push(removeData(key));
                            }
                        }
                    }
                    await Promise.all(tasks);
                }
            }
        },
        saveCreds: () => writeData(creds, 'creds')
    };
};
