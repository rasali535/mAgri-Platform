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
/**
 * @param {Array} contents - Gemini contents array
 * @param {string} systemInstruction - Optional system prompt
 * @param {{ gracefulFallback?: boolean }} [options] - If gracefulFallback=true, returns JSON string on failure (for /api/diagnose). Otherwise throws.
 */
export async function askGemini(contents, systemInstruction = "", options = {}) {
    const { gracefulFallback = false } = options;
    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        if (gracefulFallback) return JSON.stringify({ disease: 'No API Key', confidence: 0, recommendation: 'GEMINI_API_KEY is not configured.' });
        throw new Error('MISSING_GEMINI_API_KEY');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTry = [
        'gemini-2.0-flash',       // Newest, highest priority
        'gemini-1.5-flash-latest',
        'gemini-1.5-flash',
        'gemini-1.5-flash-8b',
        'gemini-1.5-pro',
    ];
    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            console.log(`[AI Service] Attempting with ${modelName}...`);
            const model = genAI.getGenerativeModel({ 
                model: modelName,
                ...(systemInstruction ? { systemInstruction } : {})
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
            const status = error.status || (error.message?.includes('429') ? 429 : (error.message?.includes('404') ? 404 : 0));
            
            console.warn(`[AI Service] ${modelName} failed (Status: ${status}):`, error.message);
            
            const isLeaked = error.message?.toLowerCase().includes('leaked');
            const isExpired = error.message?.toLowerCase().includes('expired');
            
            if (status === 401 || status === 403 || isLeaked || isExpired) {
                const reason = isLeaked ? 'API_KEY_LEAKED' : (isExpired ? 'API_KEY_EXPIRED' : 'AI_AUTH_FAILED');
                console.error(`[AI Service] Authentication failed (${reason}). PLEASE UPDATE YOUR API KEY IN .env.`);
                
                if (gracefulFallback) return JSON.stringify({ 
                    disease: 'Authentication Error', 
                    confidence: 0, 
                    recommendation: `AI Service key is ${isLeaked ? 'leaked' : (isExpired ? 'expired' : 'invalid')}. Please update it in the server configuration.` 
                });
                
                throw new Error(reason);
            }
            // For 429 (quota) and other errors, continue to next model
        }
    }

    console.error('[AI Service] All models exhausted. Last error:', lastError?.message);
    
    if (gracefulFallback) {
        return JSON.stringify({
            disease: "Service Temporarily Busy",
            confidence: 0,
            recommendation: "mARI is currently processing many requests. Please wait a moment and try again."
        });
    }
    
    // Throw so callers (USSD, chat) can present a clean error message
    throw new Error(`AI_ALL_MODELS_FAILED: ${lastError?.message || 'Unknown error'}`);
}
