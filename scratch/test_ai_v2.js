import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

async function list() {
    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // List models is usually not in the main SDK entry point for browser/node simple usage, 
        // but let's try to find it or check the docs.
        // Actually, let's just try "gemini-pro" which is the most legacy.
        
        const testModel = "gemini-1.5-flash-latest"; // Try the -latest tag
        const model = genAI.getGenerativeModel({ model: testModel });
        const result = await model.generateContent("Hi");
        console.log("Success with -latest!");
    } catch (e) {
        console.log("Error:", e.message);
    }
}
list();
