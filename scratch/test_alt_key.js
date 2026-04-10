import 'dotenv/config';
import { askGemini } from '../services/ai.js';

async function test() {
    try {
        console.log('Testing AI connectivity with potential key...');
        // Manually set API key for this test
        process.env.VITE_GEMINI_API_KEY = "AIzaSyCMIybxAdo-o0cQOC0AgvzLN7Ja4ofBNN4";
        const response = await askGemini([{ role: 'user', parts: [{ text: 'Hello' }] }]);
        console.log('AI Response:', response);
    } catch (e) {
        console.error('AI Test Failed:', e.message);
    }
}

test();
