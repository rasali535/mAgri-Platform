import React from 'react';
import { WifiOff, Smartphone, RefreshCw, Database, Key, Activity, Signal, Zap, ShieldCheck, MapPin, PhoneCall } from 'lucide-react';
import { motion } from 'motion/react';

export default function USSDSettings({ onBack }: { onBack: () => void }) {
  const apiKey = "AIzaSyCMIybxAdo-o0cQOC0AgvzLN7Ja4ofBNN4"; // Simulated for display
  const isApiKeySet = true;
  const maskedKey = `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">Connectivity Bridge</h2>
          <p className="text-neutral-500 font-medium">Manage USSD synchronization and offline access.</p>
        </div>
        <button 
          onClick={onBack}
          className="text-sm font-bold text-neutral-500 hover:text-emerald-600 transition-colors bg-white px-4 py-2 rounded-xl border border-neutral-100 shadow-sm flex items-center"
        >
          <RefreshCw size={14} className="mr-2" /> Force Global Sync
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Status & Bridge Details */}
        <div className="lg:col-span-7 space-y-8">
           <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-neutral-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5 transform translate-x-1/4 -translate-y-1/4">
                 <Signal size={200} />
              </div>
              
              <div className="relative z-10">
                 <div className="flex items-center space-x-3 mb-8">
                    <div className="bg-emerald-100 p-3 rounded-2xl">
                       <Zap size={24} className="text-emerald-600" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-neutral-900 leading-none">USSD Core Active</h3>
                       <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Status: Fully Operational</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-neutral-50 rounded-3xl p-6 border border-neutral-100">
                       <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Main Access Code</h4>
                       <p className="text-3xl font-black text-neutral-900 tabular-nums">*384*14032#</p>
                       <p className="text-xs text-neutral-500 font-medium mt-4 leading-relaxed">
                          Primary gateway for all mAgri-Platform services. Works globally on any GSM network without internet.
                       </p>
                    </div>
                    <div className="bg-neutral-50 rounded-3xl p-6 border border-neutral-100">
                       <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Bridge Sync Delta</h4>
                       <div className="flex items-baseline space-x-2">
                          <span className="text-3xl font-black text-neutral-900">0.02s</span>
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Real-time</span>
                       </div>
                       <p className="text-xs text-neutral-500 font-medium mt-4 leading-relaxed">
                          Low-latency replication between USSD gateway and web app database.
                       </p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-neutral-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-10 opacity-10 transform scale-150 group-hover:rotate-12 transition-transform duration-700">
                 <WifiOff size={160} />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                 <div className="bg-white/10 p-6 rounded-[2rem] backdrop-blur-md border border-white/10">
                    <Database size={48} className="text-emerald-400" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black mb-3">Hybrid Offline Architecture</h3>
                    <p className="text-neutral-400 font-medium leading-relaxed">
                       mAgri-Platform uses a dual-redundancy model. When local internet (4G/5G) fails, the platform automatically switches to USSD protocol for session continuity. No data is lost, no session is dropped.
                    </p>
                    <div className="mt-6 flex gap-4">
                       <span className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                          <Signal size={12} className="mr-2" /> GSM Secure
                       </span>
                       <span className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                          <ShieldCheck size={12} className="mr-2" /> AES-256 Synced
                       </span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Column: Key Metrics & Specific Codes */}
        <div className="lg:col-span-5 space-y-8">
           <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-neutral-100">
              <h3 className="text-lg font-bold text-neutral-800 mb-6 flex items-center">
                 <Smartphone size={20} className="mr-2 text-indigo-500" /> Topic Direct Links
              </h3>
              <div className="space-y-4">
                 {[
                   { code: "*384*14032*1#", action: "Check Credit Score",     color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
                   { code: "*384*14032*2#", action: "Apply Micro-Credit",     color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
                   { code: "*384*14032*3#", action: "Weather Forecast",       color: "bg-amber-50 text-amber-700 border-amber-100" },
                   { code: "*384*14032*4#", action: "AI Agronomist (Gemini)", color: "bg-neutral-900 text-white border-neutral-800" },
                   { code: "*384*14032*5#", action: "Marketplace Hub",        color: "bg-rose-50 text-rose-700 border-rose-100" },
                   { code: "*384*14032*6#", action: "Buyer Messages",         color: "bg-violet-50 text-violet-700 border-violet-100" },
                 ].map((link, idx) => (
                    <motion.div 
                       key={idx}
                       whileHover={{ x: 5 }}
                       className="flex items-center justify-between p-4 rounded-2xl bg-white border border-neutral-50 hover:border-neutral-200 transition-all cursor-pointer group"
                    >
                       <span className="text-sm font-bold text-neutral-700 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{link.action}</span>
                       <div className={`px-4 py-2 rounded-xl text-xs font-black border font-mono ${link.color}`}>
                          {link.code}
                       </div>
                    </motion.div>
                 ))}
                 <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest text-center pt-4">
                    Dial directly from your device dialer
                 </p>
              </div>
           </div>

           <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-neutral-100">
              <div className="flex items-center space-x-3 mb-6">
                 <div className="bg-neutral-900 p-2.5 rounded-2xl">
                    <Key size={18} className="text-white" />
                 </div>
                 <h3 className="font-bold text-neutral-900">Bridge Authentication</h3>
              </div>
              <div className="space-y-6">
                 <div>
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Infrastructure Key (PAM-IVX)</p>
                    <div className="bg-neutral-50 border border-neutral-100 px-4 py-3 rounded-2xl font-mono text-xs text-neutral-500 flex items-center justify-between">
                       <span>{maskedKey}</span>
                       <span className="text-[10px] font-black text-emerald-600 uppercase">Encrypted</span>
                    </div>
                 </div>
                 <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                    <div className="flex items-center space-x-2 text-emerald-700 mb-2">
                       <Activity size={14} className="animate-pulse" />
                       <span className="text-xs font-black uppercase tracking-widest">Gateway Health</span>
                    </div>
                    <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                       Africa's Talking callback active at <strong>/ussd</strong> and <strong>/api/ussd</strong>. AI Agronomist powered by Gemini.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

