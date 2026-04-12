import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

// To get columns, we can just try a select * on one row and look at the keys
const { data, error } = await supabase.from('vuka_users').select('*').limit(1);

if (error) {
    console.error(error);
} else {
    console.log(JSON.stringify(Object.keys(data[0] || {}), null, 2));
}
