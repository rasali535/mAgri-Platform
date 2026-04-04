import React, { useState, useRef } from 'react';
import { Camera, AlertTriangle, CheckCircle, User, Loader2, X, RefreshCcw, ShieldCheck, Zap, AlertCircle, FileText, Calendar, Activity, ChevronRight, Store } from 'lucide-react';
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
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      const base64Data = image.split(',')[1];
      const mimeType = image.split(',')[0].split(':')[1].split(';')[0];

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
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
          <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">Crop Scan</h2>
          <p className="text-neutral-500 font-medium flex items-center">
            <ShieldCheck size={16} className="mr-1.5 text-emerald-600" /> Powered by Brastorne Vision
          </p>
        </div>
        {(image || result) && (
          <button 
            onClick={() => { setImage(null); setResult(null); setEscalated(false); }}
            className="flex items-center text-sm font-bold text-neutral-600 hover:text-emerald-700 transition-colors bg-white px-4 py-2 rounded-full border border-neutral-200 shadow-sm hover:bg-neutral-50"
          >
            <RefreshCcw size={16} className="mr-2" /> New Scan
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Area */}
        <div className="lg:col-span-2 space-y-6">
          {!image && !loading && !result && (
            <InitialState onSelect={() => fileInputRef.current?.click()} />
          )}

          {(image || loading || result) && (
            <ActiveState 
               image={image} 
               loading={loading} 
               result={result} 
               escalated={escalated}
               onAnalyze={analyzeImage} 
            />
          )}

           <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
           <PastScans />
        </div>
      </div>
    </div>
  );
}

function InitialState({ onSelect }: { onSelect: () => void }) {
  return (
    <div 
      onClick={onSelect}
      className="bg-[#eaf5f0] rounded-[2.5rem] p-6 lg:p-8 cursor-pointer hover:bg-[#e1efe8] transition-colors flex flex-col md:flex-row gap-8 items-center group relative shadow-sm"
    >
       <div className="absolute top-4 right-4 p-2 bg-emerald-100/50 rounded-full text-emerald-600">
          <Camera size={20} />
       </div>
       
       <div className="w-full md:w-1/2 aspect-video md:aspect-[5/4] bg-emerald-200/40 rounded-[2rem] overflow-hidden flex items-center justify-center group-hover:bg-emerald-200/60 transition-colors">
          <div className="text-center p-6">
             <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform text-emerald-600 shadow-sm">
                <Camera size={32} />
             </div>
             <p className="font-bold text-emerald-900">Tap to upload photo</p>
             <p className="text-xs text-emerald-700/70 mt-1 font-medium">Supported: JPG, PNG</p>
          </div>
       </div>

       <div className="w-full md:w-1/2 space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-emerald-700 rounded-full text-xs font-bold shadow-sm">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             AI Ready
          </div>
          <h2 className="text-4xl lg:text-5xl font-light text-neutral-800 tracking-tight leading-[1.1]">
             Diagnostic<br /><span className="font-medium">Scanner</span>
          </h2>
          <p className="text-neutral-600 text-sm leading-relaxed mt-2 font-medium">
             Upload a clear image of an affected leaf, pest, or crop issue. Our AI evaluates the visual data to provide an immediate agronomy assessment.
          </p>

          <div className="flex flex-wrap gap-2 mt-4">
             <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-full text-xs font-bold text-emerald-900">
                <Zap size={14} className="text-emerald-600" /> Instant
             </div>
             <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-full text-xs font-bold text-emerald-900">
                <Activity size={14} className="text-emerald-600" /> High Accuracy
             </div>
          </div>
          
          <button className="w-full mt-2 bg-[#363a3d] text-white font-bold py-3.5 rounded-full flex items-center justify-between px-6 hover:bg-black transition-colors shadow-lg shadow-black/10 text-sm">
             Select Image
             <div className="w-7 h-7 rounded-full bg-[#cbd564] text-black flex items-center justify-center">
                <ChevronRight size={14} />
             </div>
          </button>
       </div>
    </div>
  );
}

function ActiveState({ image, loading, result, escalated, onAnalyze }: any) {
  return (
    <div className="bg-[#eaf5f0] rounded-[2.5rem] p-6 lg:p-8 flex flex-col gap-6 relative shadow-sm">
       
       <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 rounded-[2rem] overflow-hidden relative shadow-lg aspect-square md:aspect-[4/3] bg-neutral-200">
             <img src={image} className="w-full h-full object-cover" alt="Uploaded Crop" />
             {loading && (
                <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                   <Loader2 size={40} className="animate-spin mb-4 text-emerald-400" />
                   <div className="text-sm font-bold tracking-widest uppercase">Analyzing...</div>
                </div>
             )}
             {!result && !loading && (
                <div className="absolute inset-0 bg-neutral-900/40 flex items-center justify-center backdrop-blur-sm transition-all hover:bg-neutral-900/50">
                   <button onClick={onAnalyze} className="bg-[#cbd564] text-neutral-900 px-6 py-3 rounded-full font-bold shadow-xl flex items-center gap-2 hover:bg-[#d8e370] transition-all hover:scale-105 active:scale-95">
                      <Zap size={18} /> Run AI Diagnosis
                   </button>
                </div>
             )}
          </div>

          <div className="w-full md:w-1/2 flex flex-col justify-center">
             {result ? (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                   <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-emerald-700 rounded-full text-xs font-bold shadow-sm">
                      <CheckCircle size={14} /> Diagnosis Complete
                   </div>
                   <h2 className="text-3xl lg:text-4xl font-medium text-neutral-800 tracking-tight leading-[1.1]">
                      {result.disease}
                   </h2>
                   
                   <p className="text-sm border-l-2 border-emerald-300 pl-4 py-1 text-neutral-600 italic font-medium">
                      Based on visual patterns detected in the uploaded image.
                   </p>

                   <div className="flex flex-wrap gap-2 mt-2">
                       <span className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-full text-xs font-bold text-neutral-700 shadow-sm">
                          <Activity size={14} className="text-[#cbd564]" />
                          Conf: {result.confidence}%
                       </span>
                       <span className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-full text-xs font-bold text-neutral-700 shadow-sm">
                          <AlertCircle size={14} className="text-rose-500" />
                          Action Required
                       </span>
                   </div>
                </div>
             ) : (
                <div className="space-y-4">
                   <h2 className="text-3xl lg:text-4xl font-medium text-neutral-800 tracking-tight leading-[1.1]">
                      Image<br />Uploaded
                   </h2>
                   <p className="text-neutral-600 text-sm font-medium">Ready for AI processing. Tap the button on the image to begin.</p>
                </div>
             )}
          </div>
       </div>

       {result && (
          <div className="bg-white rounded-[2rem] p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 mt-2">
             <div className="flex items-center gap-2 mb-4">
                <FileText size={18} className="text-emerald-600" />
                <h4 className="font-bold text-neutral-800 text-sm uppercase tracking-widest">Recommendation</h4>
             </div>
             
             <p className="text-neutral-600 text-sm leading-relaxed mb-6 font-medium">
                {result.recommendation}
             </p>
             
             {escalated && (
                <div className="bg-amber-50 rounded-2xl p-4 flex items-start gap-3 mb-6">
                   <div className="bg-amber-200/50 p-2 rounded-full text-amber-700 shrink-0">
                      <User size={16} />
                   </div>
                   <div>
                      <h5 className="font-bold text-amber-900 text-sm mb-0.5">Expert Review Requested</h5>
                      <p className="text-xs text-amber-800 font-medium">Confidence is below 90%. An agronomist will review this and SMS you.</p>
                   </div>
                </div>
             )}

             <div className="flex flex-col sm:flex-row items-center gap-3">
                <button className="w-full sm:w-auto flex-1 bg-[#363a3d] text-white font-bold py-3.5 rounded-full hover:bg-black transition-colors text-sm shadow-md flex justify-center items-center gap-2">
                   <Store size={16} /> Find Products
                </button>
             </div>
          </div>
       )}
    </div>
  )
}

function PastScans() {
   const pastScans = [
      { id: 1, title: 'Maize Fall Armyworm', status: 'Warning', date: '15 Oct 2023', image: 'https://images.unsplash.com/photo-1598113082891-d1c216cd9cde?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 2, title: 'Healthy Tomato', status: 'Healthy', date: '9 Oct 2023', image: 'https://images.unsplash.com/photo-1592841200221-a6b1897b693e?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 3, title: 'Banana Bunchy Top', status: 'Critical', date: '2 Oct 2023', image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=150&h=150&q=80' }
   ];

   return (
      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <h3 className="font-bold text-neutral-500 text-sm">Recent Scans</h3>
            <span className="text-[10px] font-bold bg-neutral-800 text-white px-2.5 py-1 rounded-full uppercase tracking-wider">All</span>
         </div>
         
         <div className="space-y-3">
            {pastScans.map(scan => (
               <div key={scan.id} className="bg-white rounded-[1.5rem] p-3 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer shadow-sm">
                  <img src={scan.image} className="w-14 h-14 rounded-[1rem] object-cover" alt={scan.title} />
                  <div className="flex-1">
                     <h4 className="font-bold text-sm text-neutral-800 mb-0.5">{scan.title}</h4>
                     <p className="text-[10px] text-neutral-400 font-medium flex items-center gap-1">
                        <Calendar size={10} /> {scan.date}
                     </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400">
                     <ChevronRight size={14} />
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}
