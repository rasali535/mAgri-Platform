import { CloudSun, TrendingUp, AlertCircle, ChevronRight, Store, ArrowUpRight, Zap, Target, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

export default function HomeTab({ onNavigate, userRole }: { onNavigate: (tab: string) => void, userRole: 'seller' | 'buyer' | 'agronomist' }) {
  const stats = [
    { label: userRole === 'buyer' ? 'Inventory' : 'Farm Health', value: userRole === 'buyer' ? '12 Tons' : '94%', change: '+2%', icon: <Zap size={16} />, color: 'emerald' },
    { label: 'Market Prices', value: 'Live', change: 'Trending', icon: <TrendingUp size={16} />, color: 'amber' },
    { label: 'Network', value: 'Active', change: 'Ok', icon: <CloudSun size={16} />, color: 'blue' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Greetings & Stats Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">Welcome back, John!</h2>
          <p className="text-neutral-500 font-medium">
            {userRole === 'buyer' ? "Here's what's happening in the market today." : "Here's what's happening on your farm today."}
          </p>
        </div>
        <div className="flex gap-2">
          {stats.map((stat) => ( stat.label !== 'Farm Health' &&
            <div key={stat.label} className="bg-white px-4 py-2 rounded-xl shadow-sm border border-neutral-100 flex items-center space-x-2">
              <div className={`p-1.5 rounded-lg bg-${stat.color}-100 text-${stat.color}-600`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">{stat.label}</p>
                <div className="flex items-center space-x-1">
                  <span className="font-bold text-sm">{stat.value}</span>
                  <span className={`text-[10px] font-bold text-${stat.color}-600`}>{stat.change}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero Banner / Weather Deep Dive */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[2rem] p-8 text-white shadow-xl">
             <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-1/4 -translate-y-1/4">
                <CloudSun size={240} strokeWidth={1} />
             </div>
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                   <span className="inline-flex items-center px-3 py-1 bg-emerald-500/30 backdrop-blur-md rounded-full text-xs font-bold border border-emerald-400/30 mb-4">
                      <Target size={14} className="mr-2" /> Current Outlook
                   </span>
                   <h3 className="text-4xl font-bold mb-2">28°C / Partly Cloudy</h3>
                   <p className="text-emerald-50/80 font-medium max-w-sm">Optimal planting conditions expected for the next 48 hours. Humidity is at 64%.</p>
                   <button className="mt-6 px-6 py-2.5 bg-white text-emerald-800 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all active:scale-95">
                      View Full Report
                   </button>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-[1.5rem] p-6 border border-white/10 flex flex-col items-center">
                   <p className="text-xs font-bold uppercase tracking-widest text-emerald-200/60 mb-2">Precipitation</p>
                   <span className="text-4xl font-black">12%</span>
                   <p className="text-xs mt-2 text-emerald-100">Low risk of rain</p>
                </div>
             </div>
          </div>

          {/* Quick Actions Grid */}
          <div>
            <h3 className="text-lg font-bold text-neutral-800 mb-4 flex items-center">
              <Zap size={20} className="mr-2 text-emerald-600" /> Essential Tools
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ActionCard 
                onClick={() => onNavigate('diagnose')}
                icon={<AlertCircle size={22} />}
                label="Crop Scan"
                color="emerald"
                description="AI-powered disease detection"
              />
              <ActionCard 
                onClick={() => onNavigate('market')}
                icon={<Store size={22} />}
                label="Market"
                color="amber"
                description="Buy & sell produce locally"
              />
              <ActionCard 
                onClick={() => onNavigate('finance')}
                icon={<TrendingUp size={22} />}
                label="Finance"
                color="indigo"
                description="Loans, insurance & payments"
              />
              <ActionCard 
                onClick={() => onNavigate('chat')}
                icon={<MessageSquare size={22} />}
                label="Ask AI"
                color="rose"
                description="24/7 expert agronomy advice"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Section */}
        <div className="space-y-8">
          {/* Recent Activity Card */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-neutral-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-neutral-800">Recent Updates</h3>
              <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700">View All</button>
            </div>
            <div className="space-y-2">
              <ActivityItem title="Maize Leaf Scan" date="Today, 09:41 AM" status="Healthy" type="success" />
              <ActivityItem title="Weather Alert" date="Yesterday" status="Rain Expected" type="warning" />
              <ActivityItem title="MoMo Payment" date="Oct 12" status="Completed" type="neutral" />
              <ActivityItem title="Soil Analysis" date="Oct 10" status="Attention" type="error" />
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-amber-50 rounded-[2rem] p-6 border border-amber-100">
            <div className="w-10 h-10 bg-amber-200 rounded-xl flex items-center justify-center mb-4 text-amber-700">
                <AlertCircle size={20} />
            </div>
            <h4 className="font-bold text-amber-900 mb-1">Drought Resistance</h4>
            <p className="text-xs text-amber-800/70 font-medium leading-relaxed">
              Consider shifting to drought-resistant varieties like SC403 if planting continues beyond November.
            </p>
            <button className="mt-4 flex items-center text-xs font-bold text-amber-700 group">
              Read More <ArrowUpRight size={14} className="ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon, label, description, color, onClick }: { icon: any, label: string, description: string, color: string, onClick: () => void }) {
  const colorMap: any = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 active:bg-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100 active:bg-amber-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100 active:bg-indigo-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100 active:bg-rose-200',
  };

  return (
    <button 
      onClick={onClick}
      className={`${colorMap[color]} group border rounded-[1.5rem] p-5 text-left transition-all duration-300 hover:shadow-lg hover:shadow-${color}-100 hover:-translate-y-1 relative overflow-hidden`}
    >
      <div className="relative z-10">
        <div className="mb-4">{icon}</div>
        <h3 className="font-bold text-sm mb-1">{label}</h3>
        <p className="text-[10px] text-neutral-500 font-medium leading-tight opacity-0 group-hover:opacity-100 transition-opacity">{description}</p>
      </div>
      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-150 transition-transform">
        {icon}
      </div>
    </button>
  );
}

function ActivityItem({ title, date, status, type }: { title: string, date: string, status: string, type: 'success' | 'warning' | 'error' | 'neutral' }) {
  const typeStyles = {
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-rose-100 text-rose-700',
    neutral: 'bg-neutral-100 text-neutral-600',
  };

  return (
    <div className="p-3 flex items-center justify-between rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer group">
      <div className="flex items-center space-x-3">
        <div className={`w-2 h-2 rounded-full ${typeStyles[type].split(' ')[1].replace('text', 'bg')}`}></div>
        <div>
          <p className="text-sm font-bold text-neutral-800">{title}</p>
          <p className="text-[10px] text-neutral-400 font-medium">{date}</p>
        </div>
      </div>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeStyles[type]}`}>
        {status}
      </span>
    </div>
  );
}

