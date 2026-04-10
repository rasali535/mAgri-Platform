import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Centralized AI service for mARI Platform.
 * Ensures consistent model usage, timeouts, and error handling across USSD and WhatsApp.
 */

const DEFAULT_MODEL = "gemini-2.5-flash"; 
const DEFAULT_TIMEOUT = 12000; // 12 seconds

/**
 * Ask Gemini API
 * @param {Array} contents - Gemini contents array
 * @param {string} systemInstruction - Optional system prompt
 * @returns {Promise<Object>} - Gemini API response
 */
export async function askGemini(contents, systemInstruction = "") {
    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        throw new Error('MISSING_GEMINI_API_KEY');
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: DEFAULT_MODEL,
            systemInstruction: systemInstruction || undefined
        });

        // The SDK doesn't have a direct timeout option in the call, 
        // so we use a Promise wrapper for the timeout.
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
        console.error('[AI Service] Error:', error.message || error);
        throw error;
    }
}
