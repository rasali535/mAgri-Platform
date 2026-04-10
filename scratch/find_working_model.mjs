import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Try models in order of preference for a new key
const candidates = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash-001',
];

for (const modelName of candidates) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Say OK in one word.' }] }]
    });
    const text = result.response.text();
    console.log(`✅ WORKS: ${modelName} -> "${text.trim()}"`);
    process.exit(0);
  } catch (err) {
    console.log(`❌ FAIL: ${modelName} -> ${err.message.split('\n')[0].substring(0, 80)}`);
  }
}
console.log('\nNo working model found!');
