import 'dotenv/config';
import { askGemini } from '../services/ai.js';

async function test() {
    try {
        console.log('Testing Gemini API with Key:', process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY);
        const res = await askGemini([{ role: 'user', parts: [{ text: 'Hello, are you online?' }] }], 'Be concise.');
        console.log('Response:', res);
    } catch (e) {
        console.error('Test Failed:', e);
    }
}

test();
