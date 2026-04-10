import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;

async function checkModels() {
    const versions = ['v1', 'v1beta'];
    for (const v of versions) {
        console.log(`Checking version: ${v}`);
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/${v}/models?key=${API_KEY}`);
            const data = await res.json();
            if (data.models) {
                console.log(`Found ${data.models.length} models in ${v}`);
                console.log("All models:", data.models.map(m => m.name));
            } else {
                console.log(`No models found in ${v}:`, data);
            }
        } catch (e) {
            console.error(`Error in ${v}:`, e.message);
        }
    }
}

checkModels();
