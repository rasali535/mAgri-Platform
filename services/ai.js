import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Centralized AI service for mARI Platform by Pameltex Tech.
 * Ensures consistent model usage, timeouts, and error handling across USSD and WhatsApp.
 */

const DEFAULT_MODEL = "gemini-1.5-flash"; 
const FALLBACK_MODELS = ["gemini-1.5-pro", "gemini-pro"];
const DEFAULT_TIMEOUT = 25000; 

/**
 * Ask Gemini API with automatic fallback
 * @param {Array} contents - Gemini contents array
 * @param {string} systemInstruction - Optional system prompt
 * @returns {Promise<string>} - Gemini API response text
 */
export async function askGemini(contents, systemInstruction = "") {
    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        throw new Error('MISSING_GEMINI_API_KEY');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTry = [DEFAULT_MODEL, ...FALLBACK_MODELS];
    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            console.log(`[AI Service] Attempting with ${modelName}...`);
            const model = genAI.getGenerativeModel({ 
                model: modelName,
                systemInstruction: systemInstruction || undefined
            });

            const chatPromise = (async () => {
                const result = await model.generateContent({ contents });
                const response = await result.response;
                return response.text();
            })();

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('AI_API_TIMEOUT')), DEFAULT_TIMEOUT)
            );

            return await Promise.race([chatPromise, timeoutPromise]);
            
        } catch (error) {
            lastError = error;
            const status = error.status || (error.message?.includes('429') ? 429 : 0);
            
            console.warn(`[AI Service] ${modelName} failed:`, error.message);
            
            if (status === 429) {
                console.error('[AI Service] Quota exceeded. Skipping further retries.');
                throw new Error('AI_QUOTA_EXCEEDED');
            }
            if (status === 401 || status === 403) {
                console.error('[AI Service] Authentication failed. Check API Key.');
                throw new Error('AI_AUTH_FAILED');
            }
            // Continue to next model for other errors (like 404 or 500)
        }
    }

    console.error('[AI Service] All models failed.');
    throw lastError || new Error('AI_SERVICE_UNAVAILABLE');
}
