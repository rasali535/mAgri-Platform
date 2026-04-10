import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY);

async function listModels() {
    try {
        console.log("Listing models for key:", process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY);
        // The SDK doesn't have a direct listModels, we might need a raw fetch or check docs
        // Actually, let's just try gemini-1.5-flash-latest
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent("Hi");
        console.log("Success with gemini-1.5-flash-latest:", result.response.text());
    } catch (e) {
        console.error("Failed with gemini-1.5-flash-latest:", e.message);
        
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
            const result = await model.generateContent("Hi");
            console.log("Success with gemini-1.0-pro:", result.response.text());
        } catch (e2) {
            console.error("Failed with gemini-1.0-pro:", e2.message);
        }
    }
}

listModels();
