import React from 'react';
import { 
  CloudSun, TrendingUp, AlertCircle, Store, ArrowUpRight, Zap, Target, 
  MessageSquare, ChevronRight, Droplets, Wind, Thermometer, Users, HelpCircle 
} from 'lucide-react';
import { motion } from 'motion/react';

export default function HomeTab({ onNavigate, userRole, phone, location }: { 
  onNavigate: (tab: string) => void, 
  userRole: 'seller' | 'buyer' | 'agronomist',
  phone: string,
  location: {lat: number, lng: number} | null
}) {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const getPhoneRegion = (ph: string) => {
    if (ph.startsWith('+260')) return 'Zambia';
    if (ph.startsWith('+254')) return 'Kenya';
    if (ph.startsWith('+27')) return 'South Africa';
    if (ph.startsWith('+233')) return 'Ghana';
    if (ph.startsWith('+234')) return 'Nigeria';
    if (ph.startsWith('+267')) return 'Botswana';
    return 'Africa Region';
  };

  const region = getPhoneRegion(phone);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">Welcome back! 👋</h2>
          <p className="text-neutral-500 font-medium mt-1">
            {currentDate} • {phone}
          </p>
        </div>
        <div className="flex gap-2">
          <StatPill icon={<TrendingUp size={14} />} label="Market" value="Live" color="amber" />
          <StatPill icon={<CloudSun size={14} />} label="Network" value="Active" color="emerald" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left / Main Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Weather Hero */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 rounded-[2rem] p-8 text-white shadow-xl shadow-emerald-500/20">
            <div className="absolute -top-12 -right-12 opacity-10">
              <CloudSun size={260} strokeWidth={0.8} />
            </div>
            <div className="relative z-10">
              <span className="inline-flex items-center px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold border border-white/20 mb-5">
                <Target size={12} className="mr-1.5" /> Current Outlook — {region}
              </span>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h3 className="text-5xl font-black mb-1">28°C</h3>
                  <p className="text-emerald-100 font-semibold text-lg mb-1">Partly Cloudy</p>
                  <p className="text-emerald-200/70 text-sm max-w-xs">Optimal planting conditions for the next 48h. Humidity at 64%.</p>
                  <button className="mt-5 px-5 py-2.5 bg-white text-emerald-800 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:bg-emerald-50 transition-all active:scale-95">
                    View Full Report
                  </button>
                </div>
                <div className="flex gap-3">
                  <WeatherStat icon={<Droplets size={16} />} label="Precip." value="12%" />
                  <WeatherStat icon={<Wind size={16} />} label="Wind" value="14km/h" />
                  <WeatherStat icon={<Thermometer size={16} />} label="Humidity" value="64%" />
                </div>
              </div>
            </div>
          </div>

          {/* Essential Tools — 2×2 rich grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
                <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600"><Zap size={16} /></div>
                Essential Tools
              </h3>
              <span className="text-xs text-neutral-400 font-medium">Tap to explore</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ActionCard
                onClick={() => onNavigate('diagnose')}
                icon={<AlertCircle size={28} />}
                label="Crop Scan"
                description="AI-powered disease & pest detection for your crops"
                gradient="from-emerald-500 to-teal-600"
                badge="AI"
              />
              <ActionCard
                onClick={() => onNavigate('market')}
                icon={<Store size={28} />}
                label="AgriMarket"
                description="Buy & sell produce directly with local farmers"
                gradient="from-amber-400 to-orange-500"
                badge="Live"
              />
              <ActionCard
                onClick={() => onNavigate('finance')}
                icon={<TrendingUp size={28} />}
                label="Finance Hub"
                description="Access loans, insurance & payment tools"
                gradient="from-indigo-500 to-violet-600"
                badge="Score 742"
              />
              <ActionCard
                onClick={() => onNavigate('chat')}
                icon={<MessageSquare size={28} />}
                label="AI Advisor"
                description="24/7 expert agronomy advice powered by Gemini"
                gradient="from-rose-500 to-pink-600"
                badge="Online"
              />
              <ActionCard
                onClick={() => onNavigate('vuka')}
                icon={<Users size={28} />}
                label="Vuka Social"
                description="Social network and WhatsApp relay for farmers"
                gradient="from-sky-500 to-blue-600"
                badge="New"
              />
              <ActionCard
                onClick={() => onNavigate('mpotsa')}
                icon={<HelpCircle size={28} />}
                label="Mpotsa Q&A"
                description="Knowledge base for health, legal & more"
                gradient="from-purple-500 to-indigo-600"
                badge="Expert"
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* Recent Activity */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-neutral-100">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-neutral-900">Recent Updates</h3>
              <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5">
                View All <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-1">
              <ActivityItem title="Maize Leaf Scan" date="Today, 09:41 AM" status="Healthy" type="success" />
              <ActivityItem title="Weather Alert" date="Yesterday" status="Rain Expected" type="warning" />
              <ActivityItem title="MoMo Payment" date="Oct 12" status="Completed" type="neutral" />
              <ActivityItem title="Soil Analysis" date="Oct 10" status="Attention" type="error" />
            </div>
          </div>

          {/* Farm Score Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-[2rem] p-6 text-white">
            <div className="absolute top-0 right-0 opacity-5 -translate-y-4 translate-x-4">
              <Zap size={120} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400 mb-3">mARI Farm Score</p>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-black text-white">94</span>
              <span className="text-neutral-500 font-bold">/ 100</span>
            </div>
            <p className="text-xs text-neutral-400 font-medium mb-4">Excellent! Your farm health is in the top 8% of the region.</p>
            {/* Score bar */}
            <div className="w-full bg-neutral-700 rounded-full h-2 mb-4">
              <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-2 rounded-full" style={{ width: '94%' }} />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Live Monitoring</span>
            </div>
          </div>

          {/* Tip Card */}
          <div className="bg-amber-50 rounded-[2rem] p-5 border border-amber-100 flex flex-col items-start">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-400/30">
                <AlertCircle size={16} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Agronomy Tip</p>
            </div>
            <h4 className="font-bold text-amber-900 mb-1.5">Drought Resistance</h4>
            <p className="text-xs text-amber-800/70 font-medium leading-snug">
              Consider shifting to drought-resistant varieties like SC403 if planting continues beyond November.
            </p>
            <button className="mt-3 flex items-center text-xs font-black text-amber-700 group">
              Read More <ArrowUpRight size={14} className="ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatPill({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colors: any = {
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  };
  return (
    <div className={`${colors[color]} border px-4 py-2 rounded-2xl flex items-center gap-2 text-sm font-bold`}>
      {icon}
      <span className="text-neutral-500 font-medium text-xs">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function WeatherStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/10 flex flex-col items-center min-w-[72px]">
      <div className="mb-1 text-emerald-200">{icon}</div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-200/60 mb-0.5">{label}</p>
      <p className="text-lg font-black">{value}</p>
    </div>
  );
}

function ActionCard({ icon, label, description, gradient, badge, onClick }: {
  icon: React.ReactNode; label: string; description: string;
  gradient: string; badge: string; onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`group bg-gradient-to-br ${gradient} rounded-[1.75rem] p-6 text-left text-white shadow-lg relative overflow-hidden w-full`}
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      <div className="absolute -bottom-8 -right-8 opacity-10 group-hover:opacity-20 transition-opacity">
        <div className="scale-[2.5]">{icon}</div>
      </div>

      <div className="relative z-10 flex flex-col h-full gap-3">
        {/* Top row: icon + badge */}
        <div className="flex items-start justify-between">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
            {icon}
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 backdrop-blur px-2.5 py-1 rounded-full border border-white/20">
            {badge}
          </span>
        </div>

        {/* Label + description */}
        <div className="mt-1">
          <h3 className="font-black text-base mb-1">{label}</h3>
          <p className="text-white/70 text-xs font-medium leading-snug">{description}</p>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-1 text-white/60 text-xs font-bold mt-auto group-hover:text-white transition-colors">
          Open <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </motion.button>
  );
}

function ActivityItem({ title, date, status, type }: { title: string; date: string; status: string; type: 'success' | 'warning' | 'error' | 'neutral' }) {
  const styles = {
    success: { dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
    warning: { dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700' },
    error:   { dot: 'bg-rose-500',   badge: 'bg-rose-100 text-rose-700' },
    neutral: { dot: 'bg-neutral-400', badge: 'bg-neutral-100 text-neutral-600' },
  };
  return (
    <div className="px-3 py-3 flex items-center justify-between rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${styles[type].dot}`} />
        <div>
          <p className="text-sm font-bold text-neutral-800 leading-none mb-0.5">{title}</p>
          <p className="text-[10px] text-neutral-400 font-medium">{date}</p>
        </div>
      </div>
      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${styles[type].badge}`}>
        {status}
      </span>
    </div>
  );
}


