import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

async function listModels() {
    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // The SDK doesn't have a direct listModels, we might need to use fetch or check docs.
        // Actually, let's try a model that is ALMOST certainly available: gemini-1.5-flash-latest
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent("Hi");
        console.log("Success with gemini-1.5-flash-latest!");
    } catch (e) {
        console.log("Error:", e.message);
    }
}
listModels();
