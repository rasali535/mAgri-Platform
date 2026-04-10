import React from 'react';
import { CloudSun, Wind, Droplets, Thermometer, ArrowUp, ArrowDown, MapPin, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

export default function WeatherTab() {
  const forecast = [
    { day: 'Mon', temp: 28, status: 'Sunny', icon: <CloudSun className="text-amber-400" /> },
    { day: 'Tue', temp: 26, status: 'Light Rain', icon: <Droplets className="text-blue-400" /> },
    { day: 'Wed', temp: 24, status: 'Cloudy', icon: <Wind className="text-neutral-400" /> },
    { day: 'Thu', temp: 29, status: 'Sunny', icon: <CloudSun className="text-amber-400" /> },
    { day: 'Fri', temp: 31, status: 'Sunny', icon: <CloudSun className="text-amber-500" /> },
  ];

  return (
    <div className="flex flex-col space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-emerald-600 font-bold uppercase tracking-widest text-xs">
            <MapPin size={14} />
            <span>Southern Africa Region</span>
          </div>
          <h2 className="text-4xl font-black text-neutral-900 font-outfit tracking-tighter uppercase">
            Weather Forecast
          </h2>
          <p className="text-neutral-500 font-medium">Real-time agricultural weather insights for your crops.</p>
        </div>
        <div className="bg-white px-6 py-4 rounded-3xl border border-neutral-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none">Today</p>
            <p className="text-sm font-bold text-neutral-800">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* Hero Weather Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 to-emerald-950 rounded-[3rem] p-10 text-white shadow-2xl shadow-emerald-900/40">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <CloudSun size={300} strokeWidth={0.5} />
        </div>
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-baseline space-x-2">
              <span className="text-8xl font-black font-outfit tracking-tighter">28°</span>
              <span className="text-2xl font-bold text-emerald-400">C</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold font-outfit">Partly Cloudy</h3>
              <p className="text-emerald-300 font-medium">Perfect conditions for planting and weeding.</p>
            </div>
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl flex items-center space-x-3">
                <Droplets size={20} className="text-blue-300" />
                <div>
                  <p className="text-[10px] font-black uppercase text-emerald-300">Humidity</p>
                  <p className="text-sm font-bold">42%</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl flex items-center space-x-3">
                <Wind size={20} className="text-emerald-300" />
                <div>
                  <p className="text-[10px] font-black uppercase text-emerald-300">Wind</p>
                  <p className="text-sm font-bold">12 km/h</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 space-y-6">
            <h4 className="font-black uppercase tracking-widest text-xs text-emerald-300">5-Day Outlook</h4>
            <div className="space-y-4">
              {forecast.map((f, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="w-12 font-bold text-sm text-neutral-300">{f.day}</span>
                  <div className="flex items-center space-x-3 flex-1 px-4">
                    {f.icon}
                    <span className="text-xs font-semibold text-white/60">{f.status}</span>
                  </div>
                  <span className="font-bold text-sm">{f.temp}°</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Agricultural Advice Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-200 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <ArrowUp size={24} />
          </div>
          <h4 className="text-lg font-bold text-neutral-900 font-outfit">Optimal Planting</h4>
          <p className="text-sm text-neutral-500 font-medium leading-relaxed">The next 48 hours show ideal soil temperature and moisture for maize planting in Lusaka East.</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-200 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
            <ArrowDown size={24} />
          </div>
          <h4 className="text-lg font-bold text-neutral-900 font-outfit">Frost Warning</h4>
          <p className="text-sm text-neutral-500 font-medium leading-relaxed">Minor night frost expected in Southern Province on Wednesday. Cover sensitive nursery crops.</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-200 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <Droplets size={24} />
          </div>
          <h4 className="text-lg font-bold text-neutral-900 font-outfit">Irrigation Alert</h4>
          <p className="text-sm text-neutral-500 font-medium leading-relaxed">Lower humidity levels mean increased evaporation. Consider active irrigation for leafy vegetables.</p>
        </div>
      </div>
    </div>
  );
}
