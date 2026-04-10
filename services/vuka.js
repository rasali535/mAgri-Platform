import { getSupabaseClient } from '../src/lib/supabaseClient.js';
import { sock } from '../whatsapp/baileys.js';
import { sendSMS } from '../whatsapp/africa.js';

const supabase = getSupabaseClient();

export const VukaService = {
    getUser: async (msisdn) => {
        const { data, error } = await supabase
            .from('vuka_users')
            .select('*')
            .eq('msisdn', msisdn)
            .single();
        if (error && error.code !== 'PGRST116') console.error('getUser error:', error);
        return data;
    },

    registerUser: async (msisdn, name) => {
        const { error } = await supabase
            .from('vuka_users')
            .upsert({ msisdn, name });
        if (error) console.error('registerUser error:', error);
        return !error;
    },

    addFriend: async (userMsisdn, friendMsisdn) => {
        try {
            // Bidirectional relationship
            const { error: err1 } = await supabase
                .from('friends')
                .upsert({ user_msisdn: userMsisdn, friend_msisdn: friendMsisdn, status: 'ACCEPTED' });
            
            const { error: err2 } = await supabase
                .from('friends')
                .upsert({ user_msisdn: friendMsisdn, friend_msisdn: userMsisdn, status: 'ACCEPTED' });

            if (err1 || err2) throw new Error(err1?.message || err2?.message);

            // Notify via SMS
            await sendSMS(friendMsisdn, `Vuka! ${userMsisdn} added you as a friend. Log in to USSD to chat!`);
            return true;
        } catch (e) {
            console.error('addFriend error:', e);
            return false;
        }
    },

    getFriends: async (msisdn) => {
        const { data, error } = await supabase
            .from('friends')
            .select('friend_msisdn')
            .eq('user_msisdn', msisdn)
            .eq('status', 'ACCEPTED');
        if (error) console.error('getFriends error:', error);
        return data || [];
    },

    createGroup: async (ownerMsisdn, name) => {
        const { data, error } = await supabase
            .from('groups')
            .insert({ name, owner_msisdn: ownerMsisdn })
            .select()
            .single();
        
        if (error) {
            console.error('createGroup error:', error);
            return null;
        }

        const groupId = data.group_id;
        await supabase.from('group_members').insert({ group_id: groupId, msisdn: ownerMsisdn });
        return groupId;
    },

    getGroups: async (msisdn) => {
        const { data, error } = await supabase
            .from('groups')
            .select('*, group_members!inner(msisdn)')
            .eq('group_members.msisdn', msisdn);
        
        if (error) console.error('getGroups error:', error);
        return data || [];
    },

    relayToWhatsApp: async (senderMsisdn, recipientMsisdn, message) => {
        if (!sock) throw new Error('WhatsApp connection not established.');
        
        const cleanJid = recipientMsisdn.replace('+', '') + '@s.whatsapp.net';
        const formattedMsg = `*Vuka Relay from ${senderMsisdn}:*\n\n${message}`;
        
        await sock.sendMessage(cleanJid, { text: formattedMsg });
        return true;
    }
};
