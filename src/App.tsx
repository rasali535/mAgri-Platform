import React, { useState } from 'react';
import { Home, Camera, MessageSquare, Wallet, FileText, Settings, UserCircle } from 'lucide-react';
import HomeTab from './components/HomeTab';
import DiagnoseTab from './components/DiagnoseTab';
import ChatTab from './components/ChatTab';
import FinanceTab from './components/FinanceTab';
import ArchitectureTab from './components/ArchitectureTab';
import AgronomistDashboard from './components/AgronomistDashboard';
import CreditApplication from './components/CreditApplication';
import USSDSettings from './components/USSDSettings';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isAgronomist, setIsAgronomist] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-stone-50 text-stone-900 font-sans max-w-md mx-auto shadow-2xl relative overflow-hidden">
      {/* Header */}
      <header className="bg-emerald-700 text-white p-4 shadow-md z-10 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">mAgri Platform</h1>
          <p className="text-emerald-100 text-xs">Brastorne Digital Inclusion</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => setIsAgronomist(!isAgronomist)} className="p-2 bg-emerald-800 rounded-full hover:bg-emerald-600 transition-colors" title="Toggle Agronomist View">
            <UserCircle size={20} className={isAgronomist ? "text-amber-300" : "text-white"} />
          </button>
          <button onClick={() => setActiveTab('ussd')} className="p-2 bg-emerald-800 rounded-full hover:bg-emerald-600 transition-colors" title="USSD Settings">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20">
        {isAgronomist ? (
          <AgronomistDashboard />
        ) : (
          <>
            {activeTab === 'home' && <HomeTab onNavigate={setActiveTab} />}
            {activeTab === 'diagnose' && <DiagnoseTab />}
            {activeTab === 'chat' && <ChatTab />}
            {activeTab === 'finance' && <FinanceTab onNavigate={setActiveTab} />}
            {activeTab === 'architecture' && <ArchitectureTab />}
            {activeTab === 'credit_apply' && <CreditApplication onBack={() => setActiveTab('finance')} />}
            {activeTab === 'ussd' && <USSDSettings onBack={() => setActiveTab('home')} />}
          </>
        )}
      </main>

      {/* Bottom Navigation (Hidden in Agronomist View) */}
      {!isAgronomist && (
        <nav className="absolute bottom-0 w-full bg-white border-t border-stone-200 flex justify-around items-center h-16 pb-safe z-20">
          <NavItem icon={<Home size={20} />} label="Home" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavItem icon={<Camera size={20} />} label="Diagnose" isActive={activeTab === 'diagnose'} onClick={() => setActiveTab('diagnose')} />
          <NavItem icon={<MessageSquare size={20} />} label="Ask AI" isActive={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
          <NavItem icon={<Wallet size={20} />} label="Finance" isActive={activeTab === 'finance' || activeTab === 'credit_apply'} onClick={() => setActiveTab('finance')} />
          <NavItem icon={<FileText size={20} />} label="Arch" isActive={activeTab === 'architecture'} onClick={() => setActiveTab('architecture')} />
        </nav>
      )}
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-emerald-700' : 'text-stone-500 hover:text-stone-700'}`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
