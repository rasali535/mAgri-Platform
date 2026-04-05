import { initAuthCreds, BufferJSON, proto } from '@whiskeysockets/baileys';
import { supabase } from '../src/lib/supabaseClient.js';

export const useSupabaseAuthState = async (sessionName = 'default') => {
    // Prefix keys to allow multiple sessions if needed
    const getKey = (id) => `${sessionName}:${id}`;

    const readData = async (id) => {
        const key = getKey(id);
        const { data, error } = await supabase
            .from('wa_auth')
            .select('data')
            .eq('id', key)
            .single();

        if (error || !data) {
            return null;
        }
        return JSON.parse(JSON.stringify(data.data), BufferJSON.reviver);
    };

    const writeData = async (data, id) => {
        const key = getKey(id);
        const json = JSON.parse(JSON.stringify(data, BufferJSON.replacer));
        await supabase
            .from('wa_auth')
            .upsert({ id: key, data: json });
    };

    const removeData = async (id) => {
        const key = getKey(id);
        await supabase
            .from('wa_auth')
            .delete()
            .eq('id', key);
    };

    let creds = await readData('creds');
    if (!creds) {
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
