import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, Send, User, Users, HelpCircle } from 'lucide-react';

export default function AgronomistDashboard() {
  const [tickets, setTickets] = useState([
    {
      id: 'TKT-892',
      farmer: 'Kofi Annan',
      crop: 'Cocoa',
      aiDiagnosis: 'Black Pod Disease',
      confidence: 82,
      status: 'pending',
      time: '10 mins ago',
      image: 'https://picsum.photos/seed/cocoa/400/300'
    },
    {
      id: 'TKT-891',
      farmer: 'Grace Chanda',
      crop: 'Maize',
      aiDiagnosis: 'Fall Armyworm',
      confidence: 75,
      status: 'pending',
      time: '25 mins ago',
      image: 'https://picsum.photos/seed/maize/400/300'
    }
  ]);

  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState('');

  const handleResolve = (id: string) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: 'resolved' } : t));
    setSelectedTicket(null);
    setDiagnosis('');
    alert('Diagnosis sent to farmer via SMS/USSD.');
  };

  return (
    <div className="p-4 space-y-6 bg-stone-100 min-h-full">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-stone-800">Agronomist Portal</h2>
        <p className="text-sm text-stone-500">Review escalated AI diagnostics</p>
      </div>

      <div className="flex gap-4">
        <button className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-stone-200 flex items-center space-x-3 hover:bg-stone-50 transition-all">
          <div className="bg-sky-100 p-2 rounded-xl text-sky-600">
            <Users size={20} />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-stone-800">Vuka Social</p>
            <p className="text-[10px] text-stone-500 font-medium">Connect with farmers</p>
          </div>
        </button>
        <button className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-stone-200 flex items-center space-x-3 hover:bg-stone-50 transition-all">
          <div className="bg-purple-100 p-2 rounded-xl text-purple-600">
            <HelpCircle size={20} />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-stone-800">Mpotsa Q&A</p>
            <p className="text-[10px] text-stone-500 font-medium">Expert advice</p>
          </div>
        </button>
      </div>

      <div className="space-y-4">
        {tickets.map(ticket => (
          <div key={ticket.id} className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-2">
                <div className="bg-amber-100 p-2 rounded-full">
                  <User size={16} className="text-amber-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 text-sm">{ticket.farmer}</h3>
                  <p className="text-xs text-stone-500">{ticket.id} • {ticket.time}</p>
                </div>
              </div>
              {ticket.status === 'pending' ? (
                <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-1 rounded-full font-medium flex items-center">
                  <Clock size={10} className="mr-1" /> Pending Review
                </span>
              ) : (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-1 rounded-full font-medium flex items-center">
                  <CheckCircle size={10} className="mr-1" /> Resolved
                </span>
              )}
            </div>

            <div className="flex space-x-4">
              <img src={ticket.image} alt="Crop" className="w-24 h-24 object-cover rounded-xl" referrerPolicy="no-referrer" />
              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-[10px] text-stone-500 uppercase tracking-wider">AI Preliminary</p>
                  <p className="text-sm font-medium text-stone-800">{ticket.aiDiagnosis}</p>
                  <p className="text-xs text-amber-600 flex items-center mt-0.5">
                    <AlertTriangle size={12} className="mr-1" /> {ticket.confidence}% Confidence
                  </p>
                </div>
                
                {ticket.status === 'pending' && selectedTicket !== ticket.id && (
                  <button 
                    onClick={() => setSelectedTicket(ticket.id)}
                    className="w-full bg-stone-900 text-white text-xs font-medium py-2 rounded-lg mt-2"
                  >
                    Review Image
                  </button>
                )}
              </div>
            </div>

            {selectedTicket === ticket.id && (
              <div className="mt-4 pt-4 border-t border-stone-100 space-y-3">
                <div>
                  <label className="text-xs font-medium text-stone-700 mb-1 block">Expert Diagnosis & Recommendation</label>
                  <textarea 
                    className="w-full border border-stone-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    rows={3}
                    placeholder="Enter diagnosis to send via SMS..."
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                  ></textarea>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setSelectedTicket(null)}
                    className="flex-1 bg-stone-200 text-stone-800 text-sm font-medium py-2 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleResolve(ticket.id)}
                    disabled={!diagnosis.trim()}
                    className="flex-1 bg-emerald-600 text-white text-sm font-medium py-2 rounded-xl flex items-center justify-center disabled:opacity-50"
                  >
                    <Send size={16} className="mr-2" /> Send to Farmer
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
