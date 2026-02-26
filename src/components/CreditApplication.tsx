import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, ShieldCheck, Smartphone } from 'lucide-react';

export default function CreditApplication({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(25000);

  const handleApply = () => {
    setStep(2);
    setTimeout(() => {
      setStep(3);
    }, 2000);
  };

  return (
    <div className="p-4 space-y-6">
      <button onClick={onBack} className="flex items-center text-stone-500 text-sm font-medium hover:text-stone-800">
        <ArrowLeft size={16} className="mr-1" /> Back to Finance
      </button>

      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div>
            <h2 className="text-2xl font-bold text-stone-800">Orange Money Micro-Credit</h2>
            <p className="text-sm text-stone-500 mt-1">Based on your alternative credit score of 742</p>
          </div>

          <div className="bg-white border border-orange-200 rounded-3xl p-6 shadow-sm text-center space-y-4">
            <p className="text-sm font-medium text-stone-500 uppercase tracking-wider">Eligible Amount</p>
            <div className="text-5xl font-bold text-orange-600">
              {amount.toLocaleString()} <span className="text-2xl text-orange-400">XOF</span>
            </div>
            <input 
              type="range" 
              min="5000" 
              max="50000" 
              step="1000"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-xs text-stone-400 font-medium">
              <span>5,000 XOF</span>
              <span>50,000 XOF</span>
            </div>
          </div>

          <div className="bg-stone-50 rounded-2xl p-5 space-y-3 border border-stone-200">
            <h3 className="font-semibold text-stone-800 text-sm">Loan Terms</h3>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Interest Rate</span>
              <span className="font-medium text-stone-800">4.5% / month</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Duration</span>
              <span className="font-medium text-stone-800">3 Months (Harvest Cycle)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Repayment</span>
              <span className="font-medium text-stone-800">{(amount * 1.135).toLocaleString()} XOF</span>
            </div>
          </div>

          <button 
            onClick={handleApply}
            className="w-full bg-orange-500 text-white font-medium py-4 rounded-2xl shadow-md hover:bg-orange-600 active:scale-[0.98] transition-all"
          >
            Apply & Disburse to Wallet
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col items-center justify-center h-64 space-y-4 animate-in fade-in">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
            <Smartphone size={24} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-orange-500" />
          </div>
          <p className="font-medium text-stone-600">Processing via Orange Money API...</p>
          <p className="text-xs text-stone-400">Verifying alternative credit score</p>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col items-center justify-center py-10 space-y-6 animate-in zoom-in-95">
          <div className="bg-emerald-100 p-4 rounded-full">
            <CheckCircle size={64} className="text-emerald-500" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-stone-800">Funds Disbursed!</h2>
            <p className="text-stone-600">
              {amount.toLocaleString()} XOF has been sent to your Orange Money wallet.
            </p>
          </div>
          
          <div className="bg-stone-50 w-full rounded-2xl p-4 border border-stone-200 text-center">
            <p className="text-xs text-stone-500 mb-1">Transaction ID</p>
            <p className="font-mono text-sm text-stone-800">OM-TXN-{Math.floor(Math.random() * 1000000)}</p>
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
