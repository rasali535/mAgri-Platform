import React from 'react';
import { Wallet, ShieldCheck, TrendingUp, ArrowRight, Smartphone, Target, Zap, CreditCard, Landmark } from 'lucide-react';
import { motion } from 'motion/react';
import { useCurrency } from '../CurrencyContext';

export default function FinanceTab({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { formatCurrency } = useCurrency();

  const transactions = [
    { id: '1', title: 'Fertilizer Purchase', amount: -650, date: 'Oct 12', status: 'Completed', type: 'expense' },
    { id: '2', title: 'Crop Sale - Maize', amount: 4200, date: 'Oct 10', status: 'Completed', type: 'income' },
    { id: '3', title: 'Insurance Premium', amount: -120, date: 'Oct 05', status: 'Processing', type: 'expense' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">Financial Hub</h2>
          <p className="text-neutral-500 font-medium">Manage your farm's capital and security.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-neutral-200 text-neutral-800 font-bold py-2.5 px-6 rounded-2xl shadow-sm hover:bg-neutral-50 transition-all text-xs flex items-center">
            <Landmark size={14} className="mr-2" /> Bank Link
          </button>
          <button className="bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-2xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all text-xs flex items-center">
            <Zap size={14} className="mr-2" /> Get Credit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Credit Score & Balance */}
        <div className="lg:col-span-2 space-y-8">
           <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-800 rounded-[2.5rem] p-10 text-white shadow-2xl">
              <div className="absolute top-0 right-0 p-10 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                 <CreditCard size={280} strokeWidth={1} />
              </div>
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div>
                    <span className="inline-flex items-center px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 mb-6">
                       <Target size={12} className="mr-2" /> Credit Portfolio
                    </span>
                    <h3 className="text-neutral-200 text-sm font-bold opacity-80 mb-2 uppercase tracking-tighter">mARI Credit Score</h3>
                    <div className="flex items-baseline space-x-3">
                       <span className="text-6xl font-black">742</span>
                       <span className="text-indigo-200 text-lg font-bold opacity-60">/ 850</span>
                    </div>
                    <p className="text-indigo-100/80 text-sm font-medium mt-6 leading-relaxed max-w-sm">
                       Outstanding! Your score is based on multi-year yield analysis. You have access to premium credit lines.
                    </p>
                 </div>
                 <div className="flex flex-col justify-center space-y-6">
                    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/10 shadow-xl">
                       <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Available Credit</p>
                       <p className="text-3xl font-black">{formatCurrency(2500)}</p>
                       <div className="mt-4 flex items-center text-xs font-bold text-indigo-200">
                          <TrendingUp size={14} className="mr-2" /> 12.5% p.a. Fixed Rate
                       </div>
                    </div>
                    <button 
                      onClick={() => onNavigate && onNavigate('credit_apply')}
                      className="w-full bg-white text-indigo-800 font-bold py-4 rounded-2xl shadow-xl hover:bg-neutral-100 transition-all flex items-center justify-center gap-2"
                    >
                       Apply Now <ArrowRight size={18} />
                    </button>
                 </div>
              </div>
           </div>

           {/* Transactions */}
           <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-neutral-100">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-bold text-neutral-900">Recent Transactions</h3>
                 <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Statement Details</button>
              </div>
              <div className="space-y-2">
                 {transactions.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-neutral-50 transition-colors cursor-pointer group">
                       <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-xl ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                             {tx.type === 'income' ? <TrendingUp size={18} /> : <Wallet size={18} />}
                          </div>
                          <div>
                             <p className="text-sm font-bold text-neutral-800 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{tx.title}</p>
                             <p className="text-[10px] text-neutral-400 font-bold">{tx.date} • {tx.status}</p>
                          </div>
                       </div>
                       <span className={`text-sm font-black ${tx.type === 'income' ? 'text-emerald-600' : 'text-neutral-900'}`}>
                          {tx.type === 'income' ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}
                       </span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Sidebar / Extra Services */}
        <div className="space-y-6">
           <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-neutral-100">
              <h3 className="text-lg font-bold text-neutral-800 mb-6 flex items-center">
                 <ShieldCheck size={20} className="mr-2 text-amber-500" /> Protection
              </h3>
              <div 
                 onClick={() => onNavigate && onNavigate('insurance_apply')}
                 className="group cursor-pointer bg-neutral-50 hover:bg-emerald-50 border border-neutral-100 hover:border-emerald-200 p-6 rounded-3xl transition-all"
              >
                 <h4 className="font-bold text-neutral-900 mb-2">Crop Insurance</h4>
                 <p className="text-xs text-neutral-500 font-medium leading-relaxed mb-4">
                    Protect your maize yield against drought and pests. Mobile money linked premiums.
                 </p>
                 <div className="flex items-center text-xs font-black text-emerald-600">
                    Insure Now <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                 </div>
              </div>
           </div>

           <div className="bg-neutral-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 transform scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                 <Smartphone size={120} />
              </div>
              <div className="flex items-center space-x-3 mb-4">
                 <div className="bg-white/10 p-2 rounded-xl">
                    <Smartphone size={20} className="text-emerald-400" />
                 </div>
                 <h3 className="font-bold text-white tracking-widest uppercase text-xs">USSD Continuity</h3>
              </div>
              <p className="text-xs text-neutral-400 font-medium leading-relaxed relative z-10">
                 No internet? No problem. Access your credit limit and insurance by dialing <strong className="text-white text-sm font-black mx-1">*123#</strong> on any mobile phone.
              </p>
              <div className="mt-6 flex items-center space-x-1">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-[10px] uppercase font-black tracking-widest text-emerald-500">Bridge Active</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

