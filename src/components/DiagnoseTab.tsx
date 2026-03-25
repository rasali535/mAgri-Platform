import React, { useState, useRef } from 'react';
import { Camera, AlertTriangle, CheckCircle, User, Loader2, X, RefreshCcw, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../supabaseClient';

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
      const base64Data = image.split(',')[1];
      const mimeType = image.split(',')[0].split(':')[1].split(';')[0];

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: 'You are an expert agronomist AI. Analyze the crop image for diseases. Respond in valid JSON exactly: {"disease": "...", "confidence": 0-100, "recommendation": "..."}' },
              { inline_data: { mime_type: mimeType, data: base64Data } }
            ]
          }]
        })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      let textContent = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      textContent = textContent.replace(/^```json\n?/, '').replace(/\n?```$/, '').replace(/^```\n?/, '');

      const dataData = JSON.parse(textContent);
      const resultData = {
        disease: dataData.disease || 'Unknown Diagnosis',
        confidence: dataData.confidence || 0,
        recommendation: dataData.recommendation || 'No recommendation available.'
      };

      setResult(resultData);

      try {
        await supabase.from('resources').insert([{
          title: resultData.disease,
          type: 'Diagnosis',
          description: resultData.recommendation,
          image: image
        }]);
      } catch (dbError) {
        console.error('Supabase error:', dbError);
      }

      if (resultData.confidence < 90) setEscalated(true);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">AI Crop Diagnostic</h2>
          <p className="text-neutral-500 font-medium flex items-center">
            <ShieldCheck size={16} className="mr-1.5 text-emerald-600" /> Powered by Brastorne Vision Architecture
          </p>
        </div>
        {(image || result) && (
          <button 
            onClick={() => { setImage(null); setResult(null); setEscalated(false); }}
            className="flex items-center text-sm font-bold text-neutral-500 hover:text-rose-600 transition-colors bg-white px-4 py-2 rounded-xl border border-neutral-100 shadow-sm"
          >
            <RefreshCcw size={16} className="mr-2" /> Start New Scan
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Comparison/Upload Area */}
        <div className={`col-span-1 lg:col-span-transition ${result ? 'lg:col-span-5' : 'lg:col-span-7 mx-auto w-full max-w-2xl'}`}>
          <AnimatePresence mode="wait">
            {!image ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                className="group relative overflow-hidden bg-white border-4 border-dashed border-neutral-100 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-50/30 transition-all duration-300 min-h-[400px]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="bg-emerald-100 p-6 rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Camera size={48} className="text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-800 mb-2">Capture or Upload</h3>
                <p className="text-neutral-500 max-w-xs mx-auto">Take a clear photo of the affected plant leaf for the most accurate AI diagnosis.</p>
                <div className="mt-8 flex gap-3">
                  <span className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold shadow-lg">Mobile Camera</span>
                  <span className="px-4 py-2 bg-white border border-neutral-200 text-neutral-600 rounded-xl text-xs font-bold shadow-sm">Gallery</span>
                </div>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white group"
              >
                <img src={image} alt="Crop Scan" className="w-full aspect-square object-cover" />
                <div className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                   <div className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/30">
                      <Camera size={32} />
                   </div>
                </div>
                {!result && !loading && (
                   <button 
                     onClick={analyzeImage}
                     className="absolute bottom-6 left-6 right-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                   >
                     <Zap size={20} /> Run AI Analysis
                   </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Area */}
        {(loading || result) && (
          <div className="col-span-1 lg:col-span-7 mt-8 lg:mt-0 space-y-6">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-neutral-100 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                    <Loader2 size={64} className="text-emerald-600 animate-spin relative z-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-800">Analyzing Architecture</h3>
                    <p className="text-neutral-500 max-w-xs mx-auto mt-2">Connecting to our neural networks to identify patterns in your crop imagery...</p>
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-neutral-100 overflow-hidden relative">
                    <div className={`absolute top-0 right-0 p-8 opacity-5 transform translate-x-1/4 -translate-y-1/4`}>
                       {result.confidence >= 90 ? <CheckCircle size={200} /> : <AlertTriangle size={200} />}
                    </div>
                    
                    <div className="flex items-start justify-between relative z-10">
                      <div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 ${
                          result.confidence >= 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {result.confidence >= 90 ? 'Confident Diagnosis' : 'Uncertain Resolution'}
                        </span>
                        <h3 className="text-3xl font-black text-neutral-900">{result.disease}</h3>
                        <div className="mt-4 flex items-center gap-4">
                           <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">AI Confidence</span>
                              <span className="text-xl font-black text-neutral-800">{result.confidence}%</span>
                           </div>
                           <div className="w-px h-8 bg-neutral-100" />
                           <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">Status</span>
                              <span className={`text-xl font-black ${result.confidence >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                 {result.confidence >= 90 ? 'Verified' : 'Review Needed'}
                              </span>
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-neutral-50">
                       <h4 className="text-xs font-black text-neutral-400 uppercase tracking-[0.2em] mb-4">Recommended Protocol</h4>
                       <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100">
                          <p className="text-neutral-800 font-medium leading-relaxed">{result.recommendation}</p>
                       </div>
                    </div>

                    {escalated && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 bg-amber-50 rounded-3xl p-6 border border-amber-200"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="bg-amber-100 p-2.5 rounded-2xl">
                            <User size={20} className="text-amber-700" />
                          </div>
                          <h4 className="font-bold text-amber-900">Expert Review Requested</h4>
                        </div>
                        <p className="text-sm text-amber-800 leading-relaxed font-medium">
                          Confidence is below 90%. We've automatically escalated this to our human agronomist network. You'll receive a secondary opinion via SMS within 2 hours.
                        </p>
                      </motion.div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <button className="bg-neutral-900 text-white font-bold py-4 rounded-3xl shadow-xl hover:shadow-neutral-400/20 transition-all flex items-center justify-center gap-2">
                        Find Relevant Products
                     </button>
                     <button className="bg-white border border-neutral-200 text-neutral-800 font-bold py-4 rounded-3xl shadow-sm hover:bg-neutral-50 transition-all flex items-center justify-center gap-2">
                        Talk to AI Advisor
                     </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

