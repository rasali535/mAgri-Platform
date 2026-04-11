import 'dotenv/config';

async function listModels() {
    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    console.log("Using API Key:", apiKey.substring(0, 8) + "...");
    
    // Try v1beta
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.log("No models returned. Response:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.log("Error:", e.message);
    }
}
listModels();
