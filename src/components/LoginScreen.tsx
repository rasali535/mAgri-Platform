import React, { useState } from 'react';
import { MapPin, Phone, User, Briefcase, Store } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../supabaseClient';

type Role = 'seller' | 'buyer' | 'agronomist';

interface LoginScreenProps {
  onLogin: (phone: string, role: Role, location: { lat: number; lng: number } | null) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('seller');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 8) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    const proceedLogin = async (lat: number | null, lng: number | null) => {
      try {
        await supabase.from('webapp_logins').insert([
          { phone, role, lat, lng }
        ]);
      } catch (err) {
        console.error('Failed to save login to Supabase', err);
      }
      onLogin(phone, role, lat && lng ? { lat, lng } : null);
    };

    // Request location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          proceedLogin(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          proceedLogin(null, null);
        },
        { timeout: 10000 }
      );
    } else {
      proceedLogin(null, null);
    }
  };

  const roles: { id: Role; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'seller', label: 'Farmer / Seller', icon: <Store size={24} />, desc: 'Sell your produce and access credit' },
    { id: 'buyer', label: 'Buyer', icon: <User size={24} />, desc: 'Source fresh produce directly from farmers' },
    { id: 'agronomist', label: 'Agronomist', icon: <Briefcase size={24} />, desc: 'Provide advice and review crop scans' },
  ];

  return (
    <div className="min-h-screen bg-emerald-900 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="bg-emerald-800 p-8 text-center text-white">
          <div className="w-16 h-16 bg-white text-emerald-800 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 font-bold text-3xl">
            m
          </div>
          <h1 className="text-2xl font-bold mb-1">mARI Platform</h1>
          <p className="text-emerald-200 text-sm">Sign in to your account</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">Select Your Role</label>
              <div className="grid grid-cols-1 gap-3">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`flex items-start p-3 rounded-xl border-2 text-left transition-all ${
                      role === r.id 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-neutral-200 hover:border-emerald-200'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mr-3 ${role === r.id ? 'bg-emerald-500 text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                      {r.icon}
                    </div>
                    <div>
                      <div className="font-bold text-neutral-900">{r.label}</div>
                      <div className="text-xs text-neutral-500">{r.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                <input
                  type="tel"
                  placeholder="+254 700 000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-100 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm py-1 font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors shadow-lg shadow-emerald-600/30 flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Locating & Signing in...</span>
                </div>
              ) : (
                'Continue'
              )}
            </button>
            <p className="text-xs text-center text-neutral-400 mt-4 flex items-center justify-center">
              <MapPin size={12} className="mr-1" />
              We will securely request location access to find nearby markets
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
