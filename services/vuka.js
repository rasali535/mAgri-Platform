import db from './database.js';
import { sock } from '../whatsapp/baileys.js';
import { sendSMS } from '../whatsapp/africa.js';

export const VukaService = {
    getUser: async (msisdn) => {
        try {
            return db.prepare('SELECT * FROM users WHERE msisdn = ?').get(msisdn);
        } catch (e) {
            console.error('Vuka.getUser error:', e);
            return null;
        }
    },

    registerUser: async (msisdn, name) => {
        try {
            const stmt = db.prepare('INSERT OR REPLACE INTO users (msisdn, name) VALUES (?, ?)');
            stmt.run(msisdn, name);
            return true;
        } catch (e) {
            console.error('Vuka.registerUser error:', e);
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
                JOIN group_members gm ON g.id = gm.group_id
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

