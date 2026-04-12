import db from './database.js';
import { sock } from '../whatsapp/baileys.js';
import { sendSMS } from '../whatsapp/africa.js';
import { getSupabaseClient } from '../src/lib/supabaseClient.js';

export const VukaService = {
    getUser: async (msisdn) => {
        try {
            const cleanPhone = msisdn.replace(/\+/g, '').trim();
            // 1. Check Supabase first (Source of Truth for cross-channel)
            const supabase = getSupabaseClient();
            const { data: user, error } = await supabase.from('vuka_users').select('*').eq('msisdn', cleanPhone).maybeSingle();
            
            if (user) {
                // Keep local cache in sync (Source of Truth is Supabase)
                try {
                    db.prepare(`
                        INSERT OR REPLACE INTO users (msisdn, name, whatsapp_number, lat, lng, role, bio) 
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `).run(
                        cleanPhone, 
                        user.name || '', 
                        user.whatsapp_number || cleanPhone, 
                        user.lat || null, 
                        user.lng || null, 
                        user.role || 'farmer', 
                        user.bio || ''
                    );
                } catch (e) {
                    console.error('[Vuka Cache Sync Error]', e.message);
                }
                return user;
            }

            // 2. Fallback to local SQLite if Supabase is down or user is only local (legacy)
            return db.prepare('SELECT * FROM users WHERE msisdn = ?').get(cleanPhone);
        } catch (e) {
            console.error('Vuka.getUser error:', e);
            // Last resort: local
            return db.prepare('SELECT * FROM users WHERE msisdn = ?').get(msisdn.replace(/\+/g, ''));
        }
    },

    registerUser: async (msisdn, name, whatsapp_number = null, lat = null, lng = null, role = 'farmer', bio = '') => {
        try {
            const cleanPhone = msisdn.replace(/\+/g, '').trim();
            console.log(`[Vuka] Registering ${cleanPhone} as ${name}...`);

            // 1. Write to local SQLite for fast USSD access
            try {
                db.prepare(`
                    INSERT OR REPLACE INTO users (msisdn, name, whatsapp_number, lat, lng, role, bio) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `).run(cleanPhone, name, whatsapp_number || cleanPhone, lat, lng, role, bio);
                console.log(`[Vuka] SQLite Registration entry for ${cleanPhone} [OK]`);
            } catch (sqliteErr) {
                console.error(`[Vuka] SQLite Sync FAILED for ${cleanPhone}:`, sqliteErr.message);
            }
            
            // 2. Sync to Supabase
            try {
                const supabase = getSupabaseClient();
                const { error } = await supabase.from('vuka_users').upsert({ 
                    msisdn: cleanPhone, 
                    name, 
                    whatsapp_number: whatsapp_number || cleanPhone, 
                    lat, 
                    lng, 
                    role,
                    bio
                }, { onConflict: 'msisdn' });

                if (error) {
                    console.error(`[Vuka] Supabase Sync FAILED for ${cleanPhone}:`, error.message);
                    // We don't throw here, we already saved to SQLite
                } else {
                    console.log(`[Vuka] Supabase Registration sync for ${cleanPhone} [OK]`);
                }
            } catch (sbErr) {
                console.error(`[Vuka] Supabase connection error for ${cleanPhone}:`, sbErr.message);
            }
            
            return true; // Return true because SQLite succeeded
        } catch (e) {
            console.error('[Vuka.registerUser error]', e.message);
            return false;
        }
    },

    addFriend: async (userMsisdn, friendMsisdn) => {
        try {
            // Bidirectional relationship in SQLite
            const stmt = db.prepare('INSERT OR IGNORE INTO friends (user_msisdn, friend_msisdn) VALUES (?, ?)');
            const transaction = db.transaction(() => {
                stmt.run(userMsisdn, friendMsisdn);
                stmt.run(friendMsisdn, userMsisdn);
            });
            transaction();

            // Notify via SMS
            await sendSMS(friendMsisdn, `Vuka! ${userMsisdn} added you as a friend. Log in to USSD to chat!`);
            return true;
        } catch (e) {
            console.error('Vuka.addFriend error:', e);
            return false;
        }
    },

    getFriends: async (msisdn) => {
        try {
            return db.prepare("SELECT friend_msisdn FROM friends WHERE user_msisdn = ? AND status = 'ACCEPTED'").all(msisdn);

        } catch (e) {
            console.error('Vuka.getFriends error:', e);
            return [];
        }
    },

    createGroup: async (ownerMsisdn, name) => {
        try {
            const stmt = db.prepare('INSERT INTO groups (name, owner_msisdn) VALUES (?, ?)');
            const info = stmt.run(name, ownerMsisdn);
            const groupId = info.lastInsertRowid;

            db.prepare('INSERT INTO group_members (group_id, msisdn) VALUES (?, ?)').run(groupId, ownerMsisdn);
            return groupId;
        } catch (e) {
            console.error('Vuka.createGroup error:', e);
            return null;
        }
    },

    getGroups: async (msisdn) => {
        try {
            return db.prepare(`
                SELECT g.* FROM groups g
                JOIN group_members gm ON g.group_id = gm.group_id
                WHERE gm.msisdn = ?
            `).all(msisdn);
        } catch (e) {
            console.error('Vuka.getGroups error:', e);
            return [];
        }
    },

    relayToWhatsApp: async (senderMsisdn, recipientMsisdn, message) => {
        const activeSock = sock || global.wa_sock;
        if (!activeSock) {
            console.error('[Vuka Bridge] No active WhatsApp socket.');
            throw new Error('WhatsApp connection not established.');
        }
        
        const cleanRecipient = recipientMsisdn.replace('+', '').replace('whatsapp:', '').trim();
        const jid = `${cleanRecipient}@s.whatsapp.net`;
        const formattedMsg = `*Vuka Relay from ${senderMsisdn}:*\n\n${message}`;
        
        try {
            await activeSock.sendMessage(jid, { text: formattedMsg });
            
            // Track the relay session
            db.prepare('INSERT OR REPLACE INTO relay_sessions (jid, gsmMsisdn, lastActive) VALUES (?, ?, CURRENT_TIMESTAMP)')
              .run(jid, senderMsisdn);

            return true;
        } catch (e) {
            console.error('[Vuka Bridge] Relay error:', e.message);
            throw e;
        }
    },

    getPosts: async () => {
        try {
            const supabase = getSupabaseClient();
            const { data, error } = await supabase
                .from('vuka_posts')
                .select('*, author:vuka_users(name)')
                .order('created_at', { ascending: false })
                .limit(50);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('[Vuka.getPosts]', error.message);
            return [];
        }
    },

    createPost: async (msisdn, content) => {
        try {
            const cleanPhone = msisdn.replace(/\+/g, '').trim();
            const supabase = getSupabaseClient();
            const { error } = await supabase
                .from('vuka_posts')
                .insert({
                    author_msisdn: cleanPhone,
                    content: content
                });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('[Vuka.createPost]', error.message);
            throw error;
        }
    }
};

