import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

console.log('Listing available models...\n');
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
);
const data = await response.json();
if (data.models) {
  const generatable = data.models.filter(m => 
    m.supportedGenerationMethods?.includes('generateContent')
  );
  console.log('Models that support generateContent:');
  generatable.forEach(m => console.log(' -', m.name));
} else {
  console.log('Response:', JSON.stringify(data, null, 2));
}
