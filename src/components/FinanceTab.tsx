import React from 'react';
import { Wallet, ShieldCheck, TrendingUp, ArrowRight, Smartphone } from 'lucide-react';
import { useCurrency } from '../CurrencyContext';

export default function FinanceTab({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { formatCurrency } = useCurrency();

  return (
    <div className="p-4 space-y-6">
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <h2 className="text-indigo-100 text-sm font-medium mb-1">Alternative Credit Score</h2>
        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-bold">742</span>
          <span className="text-indigo-200 text-sm">/ 850</span>
        </div>
        <p className="text-xs text-indigo-200 mt-4 max-w-[80%]">
          Based on your yield history and platform usage. You are eligible for micro-credit.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-stone-800 mb-3">Financial Services</h3>
        <div className="space-y-3">
          <ServiceCard 
            icon={<Wallet className="text-orange-500" />}
            title="Mobile Money Micro-Credit"
            description={`Apply for up to ${formatCurrency(2000)} for seeds and fertilizer.`}
            onClick={() => onNavigate && onNavigate('credit_apply')}
          />
          <ServiceCard 
            icon={<ShieldCheck className="text-yellow-500" />}
            title="Mobile Money Crop Insurance"
            description="Protect your maize yield against drought."
            onClick={() => onNavigate && onNavigate('insurance_apply')}
          />
        </div>
      </div>

      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5">
        <div className="flex items-center space-x-3 mb-3">
          <Smartphone className="text-stone-500" />
          <h3 className="font-semibold text-stone-800">USSD Bridge Active</h3>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          Your data is synced. If you lose 3G/4G connection, you can continue accessing your financial services by dialing <strong>*123#</strong> on your feature phone.
        </p>
      </div>
    </div>
  );
}

function ServiceCard({ icon, title, description, onClick }: { icon: React.ReactNode, title: string, description: string, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white border border-stone-100 rounded-2xl p-4 shadow-sm flex items-center space-x-4 ${onClick ? 'active:bg-stone-50 cursor-pointer' : ''}`}
    >
      <div className="bg-stone-50 p-3 rounded-xl">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-stone-800 text-sm">{title}</h4>
        <p className="text-xs text-stone-500 mt-1">{description}</p>
      </div>
      <ArrowRight size={16} className="text-stone-400" />
    </div>
  );
}
