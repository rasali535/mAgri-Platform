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
                // Keep local cache in sync
                try {
                    db.prepare('INSERT OR REPLACE INTO users (msisdn, name, whatsapp_number, lat, lng, role, bio) VALUES (?, ?, ?, ?, ?, ?, ?)')
                      .run(cleanPhone, user.name, user.whatsapp_number, user.lat, user.lng, user.role, user.bio || '');
                } catch (e) {}
                return user;
            }

            // 2. Fallback to local SQLite if Supabase is down or user is only local (legacy)
            return db.prepare('SELECT * FROM users WHERE msisdn = ?').get(cleanPhone);
        } catch (e) {
            console.error('Vuka.getUser error:', e);
            // Last resort: local
            return db.prepare('SELECT * FROM users WHERE msisdn = ?').get(msisdn);
        }
    },

    registerUser: async (msisdn, name, whatsapp_number = null, lat = null, lng = null, role = 'farmer') => {
        try {
            const cleanPhone = msisdn.replace(/\+/g, '').trim();
            console.log(`[Vuka] Registering ${cleanPhone} as ${name}`);

            // 1. Write to local SQLite for fast USSD access
            db.prepare('INSERT OR REPLACE INTO users (msisdn, name, whatsapp_number, lat, lng, role) VALUES (?, ?, ?, ?, ?, ?)')
              .run(cleanPhone, name, whatsapp_number, lat, lng, role);
            
            // 2. Sync to Supabase so web/WhatsApp dashboards reflect the registration
            const supabase = getSupabaseClient();
            const { error } = await supabase.from('vuka_users').upsert({ 
                msisdn: cleanPhone, 
                name, 
                whatsapp_number: whatsapp_number || cleanPhone, 
                lat, 
                lng, 
                role 
            }, { onConflict: 'msisdn' });

            if (error) throw error;
            return true;
        } catch (e) {
            console.error('Vuka.registerUser error:', e.message);
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
        if (!sock) throw new Error('WhatsApp connection not established.');
        
        const cleanRecipient = recipientMsisdn.replace('+', '').replace('whatsapp:', '');
        const jid = `${cleanRecipient}@s.whatsapp.net`;
        const formattedMsg = `*Vuka Relay from ${senderMsisdn}:*\n\n${message}`;
        
        try {
            await sock.sendMessage(jid, { text: formattedMsg });
            
            // Track the relay session so the recipient can reply back to the GSM user
            db.prepare('INSERT OR REPLACE INTO relay_sessions (jid, gsmMsisdn, lastActive) VALUES (?, ?, CURRENT_TIMESTAMP)')
              .run(jid, senderMsisdn);

            return true;
        } catch (e) {
            console.error('Vuka.relayToWhatsApp error:', e);
            throw e;
        }
    }
};

