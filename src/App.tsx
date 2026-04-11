import React, { useState, useEffect } from 'react';
import { 
  Home, Camera, MessageSquare, Wallet, Settings, UserCircle, Store, 
  Briefcase, Menu, X, Bell, Search, LogOut, ChevronLeft, ChevronRight,
  Users, HelpCircle, CloudSun, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import HomeTab from './components/HomeTab';
import DiagnoseTab from './components/DiagnoseTab';
import ChatTab from './components/ChatTab';
import FinanceTab from './components/FinanceTab';
import AgronomistDashboard from './components/AgronomistDashboard';
import BuyerDashboard from './components/BuyerDashboard';
import CreditApplication from './components/CreditApplication';
import InsuranceApplication from './components/InsuranceApplication';
import USSDSettings from './components/USSDSettings';
import MarketplaceTab from './components/MarketplaceTab';
import VukaTab from './components/VukaTab';
import MpotsaTab from './components/MpotsaTab';
import WeatherTab from './components/WeatherTab';
import CommunityTab from './components/CommunityTab';
import LoginScreen from './components/LoginScreen';
import SignUpScreen from './components/SignUpScreen';
import { useCurrency, COUNTRIES } from './CurrencyContext';

export default function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  const [userName, setUserName] = useState('');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  const [activeTab, setActiveTab] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'home';
  });
  const [userRole, setUserRole] = useState<'seller' | 'buyer' | 'agronomist'>('seller');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { country, setCountry } = useCurrency();

  // Sync tab with URL
  useEffect(() => {
    if (isAuth) {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', activeTab);
      window.history.replaceState({}, '', url);
    }
  }, [activeTab, isAuth]);

  // Handle cross-component navigation
  useEffect(() => {
    const handleNavChange = (e: any) => {
      if (e.detail) setActiveTab(e.detail);
    };
    const handleToggleSignUp = () => setShowSignUp(true);

    window.addEventListener('nav-change', handleNavChange);
    window.addEventListener('toggle-signup', handleToggleSignUp);
    return () => {
      window.removeEventListener('nav-change', handleNavChange);
      window.removeEventListener('toggle-signup', handleToggleSignUp);
    };
  }, []);

  const handleLogin = (phone: string, role: typeof userRole, location: {lat: number, lng: number} | null) => {
    setUserPhone(phone);
    setUserRole(role);
    setUserLocation(location);
    setIsAuth(true);
  };

  const handleSignUp = (name: string, phone: string, whatsapp: string, role: typeof userRole, location: {lat: number, lng: number} | null) => {
    setUserName(name);
    setUserPhone(phone);
    setUserRole(role);
    setUserLocation(location);
    setIsAuth(true);
  };

  const cycleRole = () => {
    setUserRole(r => r === 'seller' ? 'buyer' : r === 'buyer' ? 'agronomist' : 'seller');
  };

  const handleLogout = () => {
    setIsAuth(false);
    setUserPhone('');
  };

  const navItems = [
    { id: 'home', icon: <Home size={20} />, label: 'Dashboard' },
    { id: 'market', icon: <Store size={20} />, label: 'Marketplace' },
    { id: 'vuka', icon: <Users size={20} />, label: 'Vuka Social' },
    { id: 'mpotsa', icon: <HelpCircle size={20} />, label: 'Mpotsa Q&A' },
    { id: 'diagnose', icon: <Camera size={20} />, label: 'Crop Scan' },
    { id: 'chat', icon: <MessageSquare size={20} />, label: 'AI Advisor' },
    { id: 'weather', icon: <CloudSun size={20} />, label: 'Weather' },
    { id: 'community', icon: <Globe size={20} />, label: 'Community' },
    { id: 'finance', icon: <Wallet size={20} />, label: 'Finance' },
  ];

  if (!isAuth) {
    return showSignUp 
      ? <SignUpScreen onSignUp={handleSignUp} onBack={() => setShowSignUp(false)} />
      : <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-neutral-50 text-neutral-900 font-sans overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-emerald-900 text-white transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:block ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-950/20">
              <span className="font-bold text-xl text-white">m</span>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight text-white font-outfit uppercase tracking-tighter">mARI Platform by Pameltex Tech</h1>
              <p className="text-emerald-400 text-[10px] uppercase tracking-widest font-bold">Farmer Marketplace</p>
            </div>
          </div>

          <nav className={`flex-1 px-4 space-y-1 mt-6 ${isSidebarCollapsed ? 'px-2' : ''}`}>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                title={isSidebarCollapsed ? item.label : ''}
                className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'} w-full px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id 
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/20' 
                  : 'text-emerald-100 hover:bg-emerald-800 hover:text-white'
                }`}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                {!isSidebarCollapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="p-4 mt-auto">
            <div className={`bg-emerald-800/50 rounded-2xl border border-emerald-700/50 transition-all ${isSidebarCollapsed ? 'p-2' : 'p-4'}`}>
              {!isSidebarCollapsed && <p className="text-xs text-emerald-300 font-medium mb-2 uppercase tracking-tighter">Current Role</p>}
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                {!isSidebarCollapsed && <span className="font-semibold capitalize text-sm">{userRole}</span>}
                <button 
                  onClick={cycleRole}
                  className={`p-1.5 bg-emerald-500 rounded-lg hover:bg-emerald-400 transition-colors`}
                  title="Switch Role"
                >
                  <Briefcase size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-neutral-200 flex items-center justify-between px-4 md:px-8 z-30">
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg transition-colors">
              <Menu size={24} />
            </button>
            <span className="ml-3 font-bold text-lg">mARI Platform by Pameltex Tech</span>
          </div>

          <div className="hidden md:flex flex-1 max-w-md relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search products, advice, diagnoses..." 
              className="w-full bg-neutral-100 border-none rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none"
            />
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="relative">
              <select
                value={country.code}
                onChange={(e) => setCountry(COUNTRIES.find(c => c.code === e.target.value) || COUNTRIES[0])}
                className="bg-neutral-100 text-neutral-700 text-xs font-bold rounded-xl px-3 py-2 outline-none border border-transparent hover:border-neutral-300 cursor-pointer appearance-none pr-8 transition-all"
                title="Select Country/Currency"
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.currency}</option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                <Settings size={12} />
              </div>
            </div>

            <button className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-xl transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <button 
              onClick={() => setActiveTab('ussd')}
              className={`p-2 rounded-xl transition-colors ${activeTab === 'ussd' ? 'bg-emerald-100 text-emerald-700' : 'text-neutral-500 hover:bg-neutral-100'}`}
              title="Settings"
            >
              <Settings size={20} />
            </button>

            <div className="h-8 w-px bg-neutral-200 mx-1 hidden sm:block"></div>

            <div className="flex items-center space-x-2 pl-2">
              <div className="w-9 h-9 bg-neutral-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-emerald-500/20">
                <UserCircle size={32} className="text-neutral-400" />
              </div>
              <div className="hidden lg:block mr-2">
                <p className="text-xs font-bold">{userPhone}</p>
                <p className="text-[10px] text-neutral-500 leading-none capitalize">{userRole} Acc.</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 ml-2 text-red-500 hover:bg-neutral-100 rounded-xl transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto bg-[#F8F9FA] relative pb-20 md:pb-8">
          <div className="container mx-auto max-w-6xl p-4 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTab}-${userRole}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="min-h-full"
              >
                {activeTab === 'home' && (
                  userRole === 'agronomist' ? (
                    <AgronomistDashboard />
                  ) : userRole === 'buyer' ? (
                    <BuyerDashboard />
                  ) : (
                    <HomeTab 
                      userRole={userRole} 
                      onNavigate={setActiveTab} 
                      phone={userPhone} 
                      location={userLocation} 
                    />
                  )
                )}
                {activeTab === 'market' && <MarketplaceTab userRole={userRole} />}
                {activeTab === 'vuka' && <VukaTab />}
                {activeTab === 'mpotsa' && <MpotsaTab />}
                {activeTab === 'diagnose' && <DiagnoseTab phone={userPhone} />}
                {activeTab === 'chat' && <ChatTab />}
                {activeTab === 'finance' && <FinanceTab onNavigate={setActiveTab} />}
                {activeTab === 'weather' && <WeatherTab />}
                {activeTab === 'community' && <CommunityTab />}

                {activeTab === 'credit_apply' && <CreditApplication onBack={() => setActiveTab('finance')} />}
                {activeTab === 'insurance_apply' && <InsuranceApplication onBack={() => setActiveTab('finance')} />}
                {activeTab === 'ussd' && <USSDSettings onBack={() => setActiveTab('home')} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Bottom Nav - Mobile Only */}
        {userRole !== 'agronomist' && (
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 flex justify-around items-center h-16 pb-safe z-40">
            {navItems.filter(i => ['home', 'market', 'vuka', 'mpotsa', 'finance'].includes(i.id)).map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  activeTab === item.id ? 'text-emerald-600' : 'text-neutral-400'
                }`}
              >
                {React.cloneElement(item.icon, { size: 18 })}
                <span className="text-[10px] font-bold">{item.label}</span>
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* Sidebar Overlay - Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-neutral-900/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

