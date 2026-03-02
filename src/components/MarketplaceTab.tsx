import React, { useState } from 'react';
import { Store, Plus, MapPin, Phone, Search, ShoppingBag, X } from 'lucide-react';

type Listing = {
  id: string;
  type: 'sell' | 'buy';
  produce: string;
  quantity: string;
  price: string;
  location: string;
  user: string;
  isMine: boolean;
};

export default function MarketplaceTab() {
  const [view, setView] = useState<'browse' | 'my_listings'>('browse');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [listings, setListings] = useState<Listing[]>([
    { id: '1', type: 'buy', produce: 'Maize', quantity: '5 Tons', price: 'Negotiable', location: 'Lusaka, Zambia', user: 'AgriCorp Buyers', isMine: false },
    { id: '2', type: 'sell', produce: 'Cocoa Beans', quantity: '200 kg', price: '1,500 XOF / kg', location: 'Abidjan, CI', user: 'Kouame', isMine: false },
    { id: '3', type: 'buy', produce: 'Cashew Nuts', quantity: '1 Ton', price: 'Market Rate', location: 'Bouaké, CI', user: 'Export Co.', isMine: false },
    { id: '4', type: 'sell', produce: 'Tomatoes', quantity: '50 kg', price: '300 ZMW / box', location: 'Ndola, Zambia', user: 'Grace', isMine: false },
  ]);

  const [newListing, setNewListing] = useState({ produce: '', quantity: '', price: '', location: '' });

  const handleAddListing = () => {
    if (!newListing.produce || !newListing.quantity) return;
    
    const listing: Listing = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'sell',
      produce: newListing.produce,
      quantity: newListing.quantity,
      price: newListing.price || 'Negotiable',
      location: newListing.location || 'My Farm',
      user: 'Me',
      isMine: true
    };

    setListings([listing, ...listings]);
    setShowAddModal(false);
    setNewListing({ produce: '', quantity: '', price: '', location: '' });
    setView('my_listings');
  };

  const filteredListings = listings.filter(l => 
    (view === 'my_listings' ? l.isMine : !l.isMine) &&
    l.produce.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-stone-50">
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-stone-800">AgriMarket</h2>
          <p className="text-sm text-stone-500">Connect with buyers and sell your produce</p>
        </div>

        {/* Search Bar */}
        <div className="flex items-center bg-white border border-stone-200 rounded-2xl p-2 shadow-sm">
          <Search size={18} className="text-stone-400 ml-2" />
          <input 
            type="text" 
            placeholder="Search produce (e.g., Maize, Cocoa)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent px-3 py-1 text-sm focus:outline-none"
          />
        </div>

        {/* Tabs */}
        <div className="flex bg-stone-200/50 p-1 rounded-xl">
          <button 
            onClick={() => setView('browse')}
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${view === 'browse' ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500'}`}
          >
            Browse Market
          </button>
          <button 
            onClick={() => setView('my_listings')}
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${view === 'my_listings' ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500'}`}
          >
            My Produce
          </button>
        </div>

        {/* Listings */}
        <div className="space-y-3 pb-20">
          {filteredListings.length === 0 ? (
            <div className="text-center py-10">
              <ShoppingBag size={48} className="mx-auto text-stone-300 mb-3" />
              <p className="text-stone-500 font-medium">No listings found</p>
            </div>
          ) : (
            filteredListings.map(listing => (
              <div key={listing.id} className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${listing.type === 'buy' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {listing.type === 'buy' ? 'Buyer Looking For' : 'Farmer Selling'}
                    </span>
                    <h3 className="font-bold text-stone-800 text-lg mt-2">{listing.produce}</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-stone-800">{listing.price}</p>
                    <p className="text-xs text-stone-500">{listing.quantity}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-xs text-stone-500 mt-3 space-x-4">
                  <div className="flex items-center">
                    <MapPin size={12} className="mr-1" /> {listing.location}
                  </div>
                  <div className="flex items-center">
                    <Store size={12} className="mr-1" /> {listing.user}
                  </div>
                </div>

                {!listing.isMine && (
                  <button className="w-full mt-4 bg-stone-100 hover:bg-emerald-50 text-emerald-700 border border-stone-200 hover:border-emerald-200 font-medium py-2 rounded-xl text-sm flex items-center justify-center transition-colors">
                    <Phone size={16} className="mr-2" /> Contact {listing.type === 'buy' ? 'Buyer' : 'Seller'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-20 right-4 bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 active:scale-95 transition-all z-30"
      >
        <Plus size={24} />
      </button>

      {/* Add Listing Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center justify-center animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-4 animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-stone-800">Update Availability</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 bg-stone-100 rounded-full text-stone-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-600 ml-1">Produce Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., Maize, Cocoa, Tomatoes" 
                  value={newListing.produce}
                  onChange={e => setNewListing({...newListing, produce: e.target.value})}
                  className="w-full border border-stone-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-stone-600 ml-1">Quantity</label>
                  <input 
                    type="text" 
                    placeholder="e.g., 50 kg, 2 Tons" 
                    value={newListing.quantity}
                    onChange={e => setNewListing({...newListing, quantity: e.target.value})}
                    className="w-full border border-stone-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-600 ml-1">Price (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g., 150 ZMW" 
                    value={newListing.price}
                    onChange={e => setNewListing({...newListing, price: e.target.value})}
                    className="w-full border border-stone-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-stone-600 ml-1">Location</label>
                <input 
                  type="text" 
                  placeholder="e.g., Lusaka, Zambia" 
                  value={newListing.location}
                  onChange={e => setNewListing({...newListing, location: e.target.value})}
                  className="w-full border border-stone-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <button 
              onClick={handleAddListing}
              disabled={!newListing.produce || !newListing.quantity}
              className="w-full bg-emerald-600 text-white font-medium py-3 rounded-xl shadow-sm hover:bg-emerald-700 disabled:opacity-50 mt-4"
            >
              Post to Market
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
