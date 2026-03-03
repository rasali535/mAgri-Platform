import React, { useState } from 'react';
import { Send, Radio, MessageSquare, MapPin, Package, CheckCircle, Clock, Smartphone } from 'lucide-react';
import { useCurrency } from '../CurrencyContext';

export default function BuyerDashboard() {
  const { formatCurrency, country } = useCurrency();
  const [requests, setRequests] = useState([
    { id: 'REQ-001', crop: 'Soybeans', quantity: '5 Tons', basePrice: 800, location: 'Lusaka', status: 'active', responses: 2 }
  ]);
  
  const [ussdResponses, setUssdResponses] = useState([
    { id: 'RES-1', reqId: 'REQ-001', farmer: 'John Banda', phone: '+260 97 123 4567', offer: '2 Tons available', basePrice: 850, location: 'Kabwe', time: '10 mins ago' },
    { id: 'RES-2', reqId: 'REQ-001', farmer: 'Mary Phiri', phone: '+260 96 765 4321', offer: '3.5 Tons available', basePrice: 800, location: 'Chisamba', time: '25 mins ago' }
  ]);

  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [newReq, setNewReq] = useState({ crop: '', quantity: '', price: '', location: '' });

  const handleBroadcast = () => {
    if (!newReq.crop || !newReq.quantity) return;
    setIsBroadcasting(true);
    
    const parsedPrice = parseFloat(newReq.price);
    const basePrice = isNaN(parsedPrice) ? null : parsedPrice / country.rate;

    // Simulate SMS broadcast delay
    setTimeout(() => {
      setIsBroadcasting(false);
      setBroadcastSuccess(true);
      setRequests([{
        id: `REQ-00${requests.length + 2}`,
        crop: newReq.crop,
        quantity: newReq.quantity,
        basePrice: basePrice,
        location: newReq.location || 'Anywhere',
        status: 'active',
        responses: 0
      }, ...requests]);
      setNewReq({ crop: '', quantity: '', price: '', location: '' });
      
      setTimeout(() => setBroadcastSuccess(false), 4000);
    }, 2500);
  };

  return (
    <div className="p-4 space-y-6 bg-stone-100 min-h-full">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-indigo-900">Buyer Portal</h2>
        <p className="text-sm text-stone-500">Broadcast requests to farmers via SMS</p>
      </div>

      {/* Broadcast Form */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-indigo-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-10 -mt-10 z-0"></div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <Radio size={20} className="text-indigo-600" />
            <h3 className="font-bold text-stone-800">New Buy Request</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-stone-600 ml-1">What are you looking for?</label>
              <input 
                type="text" 
                placeholder="e.g., Maize, Soybeans, Cashew" 
                value={newReq.crop}
                onChange={e => setNewReq({...newReq, crop: e.target.value})}
                className="w-full border border-stone-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-stone-50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-600 ml-1">Target Location</label>
              <input 
                type="text" 
                placeholder="e.g., Lusaka, Ndola, Abidjan" 
                value={newReq.location}
                onChange={e => setNewReq({...newReq, location: e.target.value})}
                className="w-full border border-stone-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-stone-50"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-stone-600 ml-1">Quantity Needed</label>
                <input 
                  type="text" 
                  placeholder="e.g., 10 Tons" 
                  value={newReq.quantity}
                  onChange={e => setNewReq({...newReq, quantity: e.target.value})}
                  className="w-full border border-stone-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-stone-50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-600 ml-1">Target Price</label>
                <input 
                  type="text" 
                  placeholder={`e.g., ${Math.round(3000 * country.rate)}`} 
                  value={newReq.price}
                  onChange={e => setNewReq({...newReq, price: e.target.value})}
                  className="w-full border border-stone-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-stone-50"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={handleBroadcast}
            disabled={!newReq.crop || !newReq.quantity || isBroadcasting}
            className="w-full bg-indigo-600 text-white font-medium py-3 rounded-xl shadow-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center transition-all"
          >
            {isBroadcasting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Broadcasting SMS...
              </>
            ) : (
              <>
                <Send size={18} className="mr-2" /> Broadcast via SMS to Farmers
              </>
            )}
          </button>

          {broadcastSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl flex items-center animate-in fade-in">
              <CheckCircle size={16} className="mr-2 text-emerald-600" />
              Successfully broadcasted to 1,420 registered farmers in your target regions.
            </div>
          )}
        </div>
      </div>

      {/* USSD Responses */}
      <div className="space-y-3">
        <h3 className="font-bold text-stone-800 flex items-center">
          <Smartphone size={18} className="mr-2 text-stone-500" /> 
          Incoming USSD Offers
        </h3>
        
        {ussdResponses.map(res => (
          <div key={res.id} className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                  Response to {res.reqId}
                </span>
                <h4 className="font-bold text-stone-800 mt-2">{res.farmer}</h4>
                <p className="text-xs text-stone-500 font-mono">{res.phone}</p>
              </div>
              <span className="text-[10px] text-stone-400 flex items-center">
                <Clock size={10} className="mr-1" /> {res.time}
              </span>
            </div>

            <div className="bg-stone-50 rounded-xl p-3 space-y-2 border border-stone-100">
              <div className="flex justify-between text-sm">
                <span className="text-stone-500 flex items-center"><Package size={14} className="mr-1" /> Offer</span>
                <span className="font-semibold text-stone-800">{res.offer}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500 flex items-center"><MapPin size={14} className="mr-1" /> Location</span>
                <span className="font-medium text-stone-800">{res.location}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Asking Price</span>
                <span className="font-medium text-emerald-700">
                  {res.basePrice ? `${formatCurrency(res.basePrice)}/Ton` : 'Negotiable'}
                </span>
              </div>
            </div>

            <div className="mt-3 flex space-x-2">
              <button className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium py-2 rounded-lg transition-colors">
                Decline
              </button>
              <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium py-2 rounded-lg transition-colors flex items-center justify-center">
                <MessageSquare size={14} className="mr-1" /> Accept & Contact
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
