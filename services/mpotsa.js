import db from './database.js';
import { sendSMS } from '../whatsapp/africa.js';
import natural from 'natural';

const tokenizer = new natural.WordTokenizer();

export const MpotsaService = {
    search: async (query, msisdn) => {
        try {
            const tokens = tokenizer.tokenize(query.toLowerCase());
            const kb = db.prepare('SELECT * FROM knowledge_base').all();
            
            let bestMatch = null;
            let maxOverlap = 0;

            for (const item of kb) {
                const keywords = (item.keywords || '').toLowerCase().split(',').map(k => k.trim());
                const overlap = tokens.filter(t => keywords.some(k => k.includes(t) || t.includes(k))).length;
                
                if (overlap > maxOverlap) {
                    maxOverlap = overlap;
                    bestMatch = item;
                }
            }

            if (!bestMatch || maxOverlap === 0) {
                return {
                    type: 'NONE',
                    text: "Mpotsa Engine: Sorry, I couldn't find a direct answer. Try keywords like 'pregnancy', 'land', or 'jobs'."
                };
            }

            const responseText = bestMatch.content;

            if (responseText.length <= 160) {
                return {
                    type: 'SHORT',
                    text: responseText
                };
            } else {
                // Long answer: Send via SMS and notify via USSD
                await sendSMS(msisdn, `Mpotsa [${bestMatch.category}]: ${responseText}`);
                return {
                    type: 'LONG',
                    text: `The full answer for "${bestMatch.category}" is long and has been sent to your phone via SMS.`
                };
            }
        } catch (e) {
            console.error('Mpotsa.search error:', e);
            return { type: 'NONE', text: "Service temporarily unavailable." };
        }
    },

    classify: (query) => {
        const tokens = tokenizer.tokenize(query.toLowerCase());
        if (tokens.some(t => ['pregnant', 'health', 'doctor', 'tips'].includes(t))) return 'Health';
        if (tokens.some(t => ['law', 'legal', 'court', 'land'].includes(t))) return 'Legal';
        if (tokens.some(t => ['school', 'degree', 'study', 'education'].includes(t))) return 'Education';
        if (tokens.some(t => ['job', 'work', 'hiring', 'vacancy'].includes(t))) return 'Jobs';
        return 'General';
    }
};

