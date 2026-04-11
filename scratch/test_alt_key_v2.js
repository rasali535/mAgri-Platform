import 'dotenv/config';

async function listModels() {
    const apiKey = "AIzaSyCMIybxAdo-o0cQOC0AgvzLN7Ja4ofBNN4";
    console.log("Testing alternative key:", apiKey.substring(0, 12) + "...");
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log("SUCCESS! Available Models:");
            data.models.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.log("FAILED. Response:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.log("Error:", e.message);
    }
}
listModels();
