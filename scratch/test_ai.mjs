import { GoogleGenerativeAI } from "@google/generative-ai";

const key = "AIzaSyCyUcZ3pqM95ZKcwDJTJIzMS4oj1KvP0Mo";
const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];

for (const modelName of MODELS) {
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: "Say OK" }] }]
    });
    const text = result.response.text();
    console.log(`✅ ${modelName}: "${text.trim()}"`);
    break; // Stop on first success
  } catch (e) {
    console.error(`❌ ${modelName}: ${e.message?.split('\n')[0]}`);
  }
}
