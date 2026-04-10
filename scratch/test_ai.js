import 'dotenv/config';
import { askGemini } from '../services/ai.js';

async function test() {
    try {
        console.log('Testing AI connectivity...');
        const response = await askGemini([{ role: 'user', parts: [{ text: 'Hello' }] }]);
        console.log('AI Response:', response);
    } catch (e) {
        console.error('AI Test Failed:', e.message);
    }
}

test();
