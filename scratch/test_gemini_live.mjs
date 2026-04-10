import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
console.log('Key prefix:', apiKey ? apiKey.substring(0, 12) + '...' : 'MISSING');

try {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: 'Say hello in one word.' }] }]
  });
  const text = result.response.text();
  console.log('SUCCESS:', text);
} catch (err) {
  console.error('ERROR message:', err.message);
  console.error('HTTP Status:', err.status || err.statusCode || 'n/a');
  console.error('Error details:', JSON.stringify(err.errorDetails || {}, null, 2));
}
