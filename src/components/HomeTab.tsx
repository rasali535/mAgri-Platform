import { CloudSun, TrendingUp, AlertCircle, ChevronRight } from 'lucide-react';

export default function HomeTab({ onNavigate }: { onNavigate: (tab: string) => void }) {
  return (
    <div className="p-4 space-y-6">
      {/* Weather Widget */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-stone-500 uppercase tracking-wider">Local Weather</h2>
          <p className="text-2xl font-semibold mt-1">28°C</p>
          <p className="text-sm text-stone-600">Partly Cloudy • Lusaka, Zambia</p>
        </div>
        <CloudSun size={48} className="text-amber-500" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => onNavigate('diagnose')}
          className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex flex-col items-start text-left active:bg-emerald-100 transition-colors"
        >
          <div className="bg-emerald-200 p-2 rounded-full mb-3">
            <AlertCircle size={20} className="text-emerald-700" />
          </div>
          <h3 className="font-semibold text-emerald-900">Crop Scan</h3>
          <p className="text-xs text-emerald-700 mt-1">Identify diseases offline</p>
        </button>
        
        <button 
          onClick={() => onNavigate('finance')}
          className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 flex flex-col items-start text-left active:bg-indigo-100 transition-colors"
        >
          <div className="bg-indigo-200 p-2 rounded-full mb-3">
            <TrendingUp size={20} className="text-indigo-700" />
          </div>
          <h3 className="font-semibold text-indigo-900">Micro-Credit</h3>
          <p className="text-xs text-indigo-700 mt-1">Check your eligibility</p>
        </button>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="font-semibold text-stone-800 mb-3">Recent Activity</h3>
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <ActivityItem title="Maize Leaf Scan" date="Today, 09:41 AM" status="Healthy" />
          <div className="h-px bg-stone-100 w-full"></div>
          <ActivityItem title="Weather Alert" date="Yesterday" status="Rain Expected" />
          <div className="h-px bg-stone-100 w-full"></div>
          <ActivityItem title="MoMo Payment" date="Oct 12" status="Completed" />
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ title, date, status }: { title: string, date: string, status: string }) {
  return (
    <div className="p-4 flex items-center justify-between active:bg-stone-50 cursor-pointer">
      <div>
        <p className="font-medium text-stone-800">{title}</p>
        <p className="text-xs text-stone-500 mt-0.5">{date}</p>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-xs font-medium bg-stone-100 text-stone-600 px-2 py-1 rounded-full">{status}</span>
        <ChevronRight size={16} className="text-stone-400" />
      </div>
    </div>
  );
}
