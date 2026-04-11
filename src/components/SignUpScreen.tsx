import React, { useState } from 'react';
import { MapPin, Phone, User, Briefcase, Store, MessageCircle, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../supabaseClient';

type Role = 'seller' | 'buyer' | 'agronomist';

interface SignUpScreenProps {
  onSignUp: (name: string, phone: string, whatsapp: string, role: Role, location: { lat: number; lng: number } | null) => void;
  onBack: () => void;
}

export default function SignUpScreen({ onSignUp, onBack }: SignUpScreenProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [useDifferentWhatsapp, setUseDifferentWhatsapp] = useState(false);
  const [role, setRole] = useState<Role>('seller');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError('Please enter your full name');
      return;
    }
    if (!phone || phone.length < 8) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    const finalWhatsapp = useDifferentWhatsapp ? whatsapp : phone;

    const proceedSignUp = async (lat: number | null, lng: number | null) => {
      try {
        // Sync to Supabase vuka_users
        const { error: upsertError } = await supabase.from('vuka_users').upsert([
          { 
            msisdn: phone, 
            name, 
            whatsapp_number: finalWhatsapp,
            role,
            lat,
            lng
          }
        ], { onConflict: 'msisdn' });

        if (upsertError) throw upsertError;

        // Also record the login event
        await supabase.from('webapp_logins').insert([
          { phone, role, lat, lng }
        ]);

        onSignUp(name, phone, finalWhatsapp, role, lat && lng ? { lat, lng } : null);
      } catch (err: any) {
        console.error('Sign up failed', err);
        setError(err.message || 'Failed to complete sign up. Please try again.');
        setLoading(false);
      }
    };

    // Request location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          proceedSignUp(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          proceedSignUp(null, null);
        },
        { timeout: 10000 }
      );
    } else {
      proceedSignUp(null, null);
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-white/20"
      >
        <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 p-8 text-white relative">
          <button 
            onClick={onBack}
            className="absolute left-6 top-8 p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="w-16 h-16 bg-white text-emerald-800 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 font-bold text-3xl font-outfit uppercase tracking-tighter">
            m
          </div>
          <h1 className="text-2xl font-bold mb-1 text-center font-outfit uppercase tracking-tighter">Join mAgri community</h1>
          <p className="text-emerald-200 text-sm font-medium text-center">Complete your profile to link all devices</p>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSignUp} className="space-y-6">
            {/* Name input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-neutral-100 hover:bg-neutral-200/50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-medium transition-all"
                />
              </div>
            </div>

            {/* Phone input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700 ml-1">Primary Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input
                  type="tel"
                  placeholder="+254..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-neutral-100 hover:bg-neutral-200/50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-medium transition-all"
                />
              </div>
            </div>

            {/* WhatsApp option */}
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
              <label className="flex items-center cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded-lg border-emerald-200 text-emerald-600 focus:ring-emerald-500/20 transition-all cursor-pointer"
                  checked={useDifferentWhatsapp}
                  onChange={(e) => setUseDifferentWhatsapp(e.target.checked)}
                />
                <span className="ml-3 text-sm font-bold text-emerald-900 group-hover:text-emerald-700 transition-colors">Different WhatsApp number?</span>
              </label>

              {useDifferentWhatsapp && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4"
                >
                  <div className="relative">
                    <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                    <input
                      type="tel"
                      placeholder="WhatsApp Phone Number"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-white border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-emerald-600 mt-2 ml-1 font-medium italic">We'll use this to sync your mARI Advisor chat to WhatsApp</p>
                </motion.div>
              )}
            </div>

            {/* Role selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-neutral-700 ml-1">Your Role</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${role === r.id
                        ? 'border-emerald-500 bg-emerald-50 shadow-sm shadow-emerald-500/10'
                        : 'border-neutral-100 hover:border-emerald-200 bg-neutral-50/30'
                      }`}
                  >
                    <div className={`p-2.5 rounded-xl mb-2 transition-colors ${role === r.id ? 'bg-emerald-500 text-white' : 'bg-neutral-100 text-neutral-400'}`}>
                      {r.icon}
                    </div>
                    <span className={`text-xs font-bold ${role === r.id ? 'text-emerald-900' : 'text-neutral-500'}`}>{r.label.split(' / ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold border border-red-100"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-xl shadow-emerald-600/20 active:scale-[0.98] flex items-center justify-center text-lg"
            >
              {loading ? (
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Profile...</span>
                </div>
              ) : (
                'Sign Up'
              )}
            </button>
            
            <p className="text-[11px] text-center text-neutral-400 flex items-center justify-center px-4">
              <MapPin size={12} className="mr-1.5 flex-shrink-0" />
              By signing up, you agree to secure data synchronization across Web, USSD, and WhatsApp.
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
