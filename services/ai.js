import 'dotenv/config';

/**
 * Centralized AI service for mARI Platform.
 * Ensures consistent model usage, timeouts, and error handling across USSD and WhatsApp.
 */

const DEFAULT_MODEL = "gemini-flash-latest";
const DEFAULT_TIMEOUT = 12000; // 12 seconds
const FALLBACK_KEY = "AIzaSyDNGTLhltItUI2s9CSyLJMNLpjRxWBaxbU";

/**
 * Ask Gemini API
 * @param {Array} contents - Gemini contents array
 * @param {string} systemInstruction - Optional system prompt
 * @returns {Promise<Object>} - Gemini API response
 */
export async function askGemini(contents, systemInstruction = "") {
    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || FALLBACK_KEY;
    
    try {
        const body = { contents };
        if (systemInstruction) {
            body.system_instruction = { parts: [{ text: systemInstruction }] };
        }
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${apiKey}`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!resp.ok) {
            const errText = await resp.text();
            console.error(`[AI Service Error] Status: ${resp.status}`, errText);
            throw new Error(`AI_API_ERR_${resp.status}`);
        }
        
        const data = await resp.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I am thinking... please try again shortly.';
        
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('[AI Service] Request timed out');
            throw new Error('AI_API_TIMEOUT');
        }
        console.error('[AI Service] Error:', error.message || error);
        throw error;
    }
}
