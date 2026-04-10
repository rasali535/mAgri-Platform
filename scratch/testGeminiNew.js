import 'dotenv/config';
import fetch from 'node-fetch';

async function testGemini() {
    let apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    const model = "gemini-flash-latest"; // Or gemini-2.0-flash
    console.log('Testing API Key:', apiKey);
    console.log('Using Model:', model);

    const body = {
        contents: [{ role: 'user', parts: [{ text: 'Say hello' }] }]
    };

    try {
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        console.log('Status:', resp.status);
        const data = await resp.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

testGemini();
