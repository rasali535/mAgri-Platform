import React from 'react';
import { WifiOff, Smartphone, RefreshCw, Database, Key } from 'lucide-react';

export default function USSDSettings({ onBack }: { onBack: () => void }) {
  const apiKey = process.env.GEMINI_API_KEY;
  const isApiKeySet = !!apiKey && apiKey.length > 0;
  const maskedKey = isApiKeySet ? `${apiKey.substring(0, 8)}...` : 'Not Configured';
  return (
    <div className="p-4 space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-stone-800">Offline & USSD Bridge</h2>
        <p className="text-sm text-stone-500">Manage connectivity settings</p>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-emerald-100 p-4 rounded-full relative">
            <Database size={32} className="text-emerald-600" />
            <div className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-emerald-50 rounded-full"></div>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-emerald-900">Data Synced</h3>
          <p className="text-xs text-emerald-700 mt-1">Last sync: Just now</p>
        </div>
        <p className="text-sm text-emerald-800 leading-relaxed">
          Your crop history and credit score are saved offline. You can safely disconnect from the internet.
        </p>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <Key size={20} className={isApiKeySet ? "text-emerald-500" : "text-red-500"} />
          <h3 className="font-semibold text-stone-800 text-sm">API Key Status</h3>
        </div>
        <div className="flex justify-between items-center mt-3">
          <span className="text-xs text-stone-500">Gemini API Key:</span>
          <span className={`text-xs font-mono font-medium px-2 py-1 rounded-md ${isApiKeySet ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
            {maskedKey}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-stone-800 text-sm">Main USSD Code: <span className="text-emerald-600 font-mono">*384*14032#</span></h3>
        <p className="text-xs text-stone-500">Dial this code or the specific sub-codes from your feature phone to access mAgri services without internet (2G/3G).</p>

        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
          <ShortcodeItem code="*384*14032*1#" action="Check Credit Score" />
          <div className="h-px bg-stone-100 w-full"></div>
          <ShortcodeItem code="*384*14032*2#" action="Apply for Micro-Credit" />
          <div className="h-px bg-stone-100 w-full"></div>
          <ShortcodeItem code="*384*14032*3#" action="Check Weather Forecast" />
          <div className="h-px bg-stone-100 w-full"></div>
          <ShortcodeItem code="*384*14032*4#" action="SMS Agronomist" />
          <div className="h-px bg-stone-100 w-full"></div>
          <ShortcodeItem code="*384*14032*5#" action="View/Respond to Buyer SMS" />
        </div>
      </div>

      <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 flex items-start space-x-4">
        <WifiOff className="text-stone-400 mt-1" />
        <div>
          <h4 className="font-semibold text-stone-800 text-sm">How the Bridge Works</h4>
          <p className="text-xs text-stone-600 mt-1 leading-relaxed">
            When you move from a 4G zone to a 2G zone, the WebApp caches your session. Any actions taken via USSD will automatically sync back to this app when you reconnect to the internet.
          </p>
        </div>
      </div>
    </div>
  );
}

function ShortcodeItem({ code, action }: { code: string, action: string }) {
  return (
    <div className="p-4 flex items-center justify-between">
      <span className="text-sm font-medium text-stone-700">{action}</span>
      <a href={`tel:${code}`} className="bg-stone-100 text-stone-800 font-mono text-sm px-3 py-1.5 rounded-lg font-bold hover:bg-stone-200">
        {code}
      </a>
    </div>
  );
}
