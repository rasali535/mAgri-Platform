import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, ShieldCheck, Smartphone, CloudRain } from 'lucide-react';

export default function InsuranceApplication({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [acres, setAcres] = useState(2);

  const handleApply = () => {
    setStep(2);
    setTimeout(() => {
      setStep(3);
    }, 2000);
  };

  const premium = acres * 250; // 250 ZMW per acre
  const coverage = acres * 5000; // 5000 ZMW coverage per acre

  return (
    <div className="p-4 space-y-6">
      <button onClick={onBack} className="flex items-center text-stone-500 text-sm font-medium hover:text-stone-800">
        <ArrowLeft size={16} className="mr-1" /> Back to Finance
      </button>

      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div>
            <h2 className="text-2xl font-bold text-stone-800">MTN MoMo Crop Insurance</h2>
            <p className="text-sm text-stone-500 mt-1">Protect your maize yield against drought and pests.</p>
          </div>

          <div className="bg-white border border-yellow-200 rounded-3xl p-6 shadow-sm text-center space-y-4">
            <p className="text-sm font-medium text-stone-500 uppercase tracking-wider">Farm Size (Acres)</p>
            <div className="text-5xl font-bold text-yellow-500">
              {acres} <span className="text-2xl text-yellow-400">Acres</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="10" 
              step="1"
              value={acres}
              onChange={(e) => setAcres(Number(e.target.value))}
              className="w-full accent-yellow-500"
            />
            <div className="flex justify-between text-xs text-stone-400 font-medium">
              <span>1 Acre</span>
              <span>10 Acres</span>
            </div>
          </div>

          <div className="bg-stone-50 rounded-2xl p-5 space-y-3 border border-stone-200">
            <h3 className="font-semibold text-stone-800 text-sm">Coverage Details</h3>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Total Coverage</span>
              <span className="font-medium text-stone-800">{coverage.toLocaleString()} ZMW</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Premium (One-time)</span>
              <span className="font-medium text-stone-800">{premium.toLocaleString()} ZMW</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Payment Method</span>
              <span className="font-medium text-stone-800">MTN MoMo Wallet</span>
            </div>
          </div>

          <button 
            onClick={handleApply}
            className="w-full bg-yellow-500 text-white font-medium py-4 rounded-2xl shadow-md hover:bg-yellow-600 active:scale-[0.98] transition-all flex justify-center items-center"
          >
            <ShieldCheck size={20} className="mr-2" /> Pay Premium & Insure
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col items-center justify-center h-64 space-y-4 animate-in fade-in">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin"></div>
            <Smartphone size={24} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-yellow-500" />
          </div>
          <p className="font-medium text-stone-600">Processing via MTN MoMo API...</p>
          <p className="text-xs text-stone-400">Deducting {premium.toLocaleString()} ZMW from wallet</p>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col items-center justify-center py-10 space-y-6 animate-in zoom-in-95">
          <div className="bg-emerald-100 p-4 rounded-full">
            <CheckCircle size={64} className="text-emerald-500" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-stone-800">Crop Insured!</h2>
            <p className="text-stone-600">
              Your {acres} acres of maize are now protected for the season.
            </p>
          </div>
          
          <div className="bg-stone-50 w-full rounded-2xl p-4 border border-stone-200 text-center">
            <p className="text-xs text-stone-500 mb-1">Policy Number</p>
            <p className="font-mono text-sm text-stone-800">MOMO-INS-{Math.floor(Math.random() * 1000000)}</p>
          </div>

          <button 
            onClick={onBack}
            className="w-full bg-stone-900 text-white font-medium py-4 rounded-2xl shadow-sm hover:bg-stone-800 active:scale-[0.98] transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
