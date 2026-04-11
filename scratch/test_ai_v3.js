import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

async function test() {
    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
        const result = await model.generateContent("Hi");
        console.log("Success with gemini-1.5-flash!");
    } catch (e) {
        console.log("Error:", e.message);
    }
}
test();
