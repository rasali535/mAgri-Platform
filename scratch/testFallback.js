import 'dotenv/config';
import fetch from 'node-fetch';

async function testFallback() {
    let apiKey = "AIzaSyCMIybxAdo-o0cQOC0AgvzLN7Ja4ofBNN4";
    const model = "gemini-flash-latest"; 
    console.log('Testing Fallback API Key:', apiKey);

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

testFallback();
