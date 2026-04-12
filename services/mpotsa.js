import db from './database.js';
import { sendSMS } from '../whatsapp/africa.js';
import natural from 'natural';
import { askGemini } from './ai.js';

const tokenizer = new natural.WordTokenizer();

export const MpotsaService = {
    /**
     * Search for answers using a hybrid approach:
     * 1. Check curated Knowledge Base (SQLite)
     * 2. Fallback to Gemini AI for broader questions
     */
    search: async (query, msisdn) => {
        try {
            const tokens = tokenizer.tokenize(query.toLowerCase());
            const kb = db.prepare('SELECT * FROM knowledge_base').all();
            
            let bestMatch = null;
            let maxOverlap = 0;

            // 1. Local KB Check
            for (const item of kb) {
                const keywords = (item.keywords || '').toLowerCase().split(',').map(k => k.trim());
                const overlap = tokens.filter(t => keywords.some(k => k.includes(t) || t.includes(k))).length;
                
                if (overlap > maxOverlap) {
                    maxOverlap = overlap;
                    bestMatch = item;
                }
            }

            // 2. High Confidence Local Match
            if (bestMatch && maxOverlap >= 2) {
                const responseText = bestMatch.content;
                if (responseText.length <= 180) {
                    return { type: 'SHORT', text: responseText, fullText: responseText, source: 'curated' };
                } else {
                    await sendSMS(msisdn, `Mpotsa [Expert]: ${responseText}`);
                    return {
                        type: 'LONG',
                        text: responseText.substring(0, 140) + "... (Full answer sent via SMS)",
                        fullText: responseText,
                        source: 'curated'
                    };
                }
            }

            // 3. AI Fallback (Mpotsa Mode: Universal & Authoritative)
            console.log(`[Mpotsa] No local match for "${query}". Consulting AI for general answer...`);
            
            const systemInstruction = `You are the Mpotsa Universal Assistant. You must answer ANY general question the user has, including but NOT limited to farming, tech, health, law, life advice, history, geography, jokes, math, etc. DO NOT refuse general questions. Give concise, intelligent, and helpful answers.`;
            
            const aiResponse = await askGemini([{ role: 'user', parts: [{ text: query }] }], systemInstruction);
            
            const MAX_USSD_LENGTH = 130;
            if (aiResponse.length <= MAX_USSD_LENGTH) {
                return { type: 'SHORT', text: aiResponse, fullText: aiResponse, source: 'ai' };
            } else {
                // Send full SMS without awaiting to speed up USSD response.
                sendSMS(msisdn, `Mpotsa: ${aiResponse}`).catch(err => console.error('[Mpotsa SMS Error]', err));
                return {
                    type: 'LONG',
                    text: aiResponse.substring(0, MAX_USSD_LENGTH),
                    fullText: aiResponse,
                    source: 'ai'
                };
            }

        } catch (e) {
            console.error('Mpotsa.search error:', e);
            return { type: 'NONE', text: "Mpotsa is offline. Try later." };
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

