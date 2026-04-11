import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

async function test() {
    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    console.log('API Key present:', !!apiKey);
    
    // Test multiple models
    const models = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash-exp"];
    
    for (const m of models) {
        console.log(`\nTesting model: ${m}...`);
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Hello, world!");
            const response = await result.response;
            console.log(`✅ Success with ${m}: ${response.text().substring(0, 30)}...`);
        } catch (e) {
            console.log(`❌ Failed with ${m}: ${e.message}`);
        }
    }
}

test();
