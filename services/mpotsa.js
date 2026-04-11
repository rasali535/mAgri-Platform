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
                if (responseText.length <= 160) {
                    return { type: 'SHORT', text: responseText, fullText: responseText, source: 'curated' };
                } else {
                    await sendSMS(msisdn, `Mpotsa [Expert]: ${responseText}`);
                    return {
                        type: 'LONG',
                        text: `Answer for "${bestMatch.category}" sent via SMS.`,
                        fullText: responseText,
                        source: 'curated'
                    };
                }
            }

            // 3. AI Fallback (Mpotsa Mode: Concise & Authoritative)
            console.log(`[Mpotsa] No local match for "${query}". Consulting AI...`);
            
            const systemInstruction = `You are the Mpotsa Q&A Engine for mARI Platform. 
            Provide authoritative, concise farming or legal advice for African farmers. 
            Limit response to 300 characters. If it's very complex, provide a summary.`;
            
            const aiResponse = await askGemini([{ role: 'user', parts: [{ text: query }] }], systemInstruction);
            
            if (aiResponse.length <= 160) {
                return { type: 'SHORT', text: aiResponse, fullText: aiResponse, source: 'ai' };
            } else {
                await sendSMS(msisdn, `Mpotsa [AI]: ${aiResponse}`);
                return {
                    type: 'LONG',
                    text: `AI Expert answer sent to your phone via SMS.`,
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

