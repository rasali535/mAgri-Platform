import React, { useState, useRef } from 'react';
import { Camera, AlertTriangle, CheckCircle, User, Loader2 } from 'lucide-react';

export default function DiagnoseTab() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ disease: string; confidence: number; recommendation: string } | null>(null);
  const [escalated, setEscalated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setEscalated(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      // Remove data:image/*;base64, prefix for the API call
      const base64Data = image.split(',')[1];
      const mimeType = image.split(',')[0].split(':')[1].split(';')[0];

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: 'You are an expert agronomist AI analyzing crop imagery. You must respond with valid JSON only. Your JSON must precisely match this format {"disease": "Disease Name", "confidence": 95, "recommendation": "Detailed recommendation."}' },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              }
            ]
          }]
        })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      let textContent = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      try {
        // Strip markdown blocks if the AI returned them alongside JSON
        textContent = textContent.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        textContent = textContent.replace(/^```\n?/, '').replace(/\n?```$/, '');

        const dataData = JSON.parse(textContent);


        const resultData = {
          disease: dataData.disease || 'Unknown Diagnosis',
          confidence: dataData.confidence || 0,
          recommendation: dataData.recommendation || 'No recommendation available.'
        };

        setResult(resultData);
        // Human-AI Escalation Logic
        if (resultData.confidence < 90) {
          setEscalated(true);
        }
      } catch (parseError) {
        console.error('Failed to parse JSON response:', textContent);
        alert('Failed to interpret model analysis. Please try again.');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert('Failed to connect to diagnostic service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-stone-800">Crop Disease Diagnostic</h2>
        <p className="text-sm text-stone-500">Powered by Tiny-LiteNet architecture</p>
      </div>

      {!image ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-emerald-300 bg-emerald-50 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-emerald-100 transition-colors h-64"
        >
          <div className="bg-white p-4 rounded-full shadow-sm mb-4">
            <Camera size={32} className="text-emerald-600" />
          </div>
          <p className="font-medium text-emerald-900">Tap to take a photo</p>
          <p className="text-xs text-emerald-600 mt-2">or upload from gallery</p>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-3xl overflow-hidden shadow-md">
            <img src={image} alt="Crop" className="w-full h-64 object-cover" />
            <button
              onClick={() => { setImage(null); setResult(null); setEscalated(false); }}
              className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm"
            >
              Retake
            </button>
          </div>

          {!result && !loading && (
            <button
              onClick={analyzeImage}
              className="w-full bg-emerald-600 text-white font-medium py-4 rounded-2xl shadow-sm hover:bg-emerald-700 active:scale-[0.98] transition-all"
            >
              Analyze Crop
            </button>
          )}

          {loading && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex flex-col items-center justify-center space-y-4">
              <Loader2 size={32} className="text-emerald-600 animate-spin" />
              <p className="text-sm font-medium text-stone-600">Running diagnostic model...</p>
            </div>
          )}

          {result && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-stone-800">{result.disease}</h3>
                  <p className="text-sm text-stone-500 mt-1">Confidence Score: {result.confidence}%</p>
                </div>
                {result.confidence >= 90 ? (
                  <CheckCircle size={24} className="text-emerald-500" />
                ) : (
                  <AlertTriangle size={24} className="text-amber-500" />
                )}
              </div>

              <div className="bg-stone-50 p-4 rounded-xl">
                <p className="text-sm text-stone-700 leading-relaxed">{result.recommendation}</p>
              </div>

              {escalated && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="bg-amber-100 p-2 rounded-full">
                      <User size={16} className="text-amber-700" />
                    </div>
                    <h4 className="font-semibold text-amber-900 text-sm">Human-AI Escalation Triggered</h4>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    The AI confidence score is below the 90% threshold. This query has been automatically routed to a human agronomist for review. You will receive an SMS with their assessment shortly.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
