import React, { useState } from 'react';
import { Store, Plus, MapPin, Phone, Search, ShoppingBag, X, Filter, ChevronDown, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency } from '../CurrencyContext';

type Listing = {
  id: string;
  type: 'sell' | 'buy';
  produce: string;
  quantity: string;
  basePrice: number | null;
  location: string;
  user: string;
  isMine: boolean;
  image?: string;
};

export default function MarketplaceTab() {
  const [view, setView] = useState<'browse' | 'my_listings'>('browse');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'sell' | 'buy'>('all');
  const { formatCurrency, country } = useCurrency();

  const [listings, setListings] = useState<Listing[]>([
    { id: '1', type: 'buy', produce: 'Maize', quantity: '5 Tons', basePrice: null, location: 'Lusaka, Zambia', user: 'AgriCorp Buyers', isMine: false },
    { id: '2', type: 'sell', produce: 'Cocoa Beans', quantity: '200 kg', basePrice: 60, location: 'Abidjan, CI', user: 'Kouame', isMine: false },
    { id: '3', type: 'buy', produce: 'Cashew Nuts', quantity: '1 Ton', basePrice: null, location: 'Bouaké, CI', user: 'Export Co.', isMine: false },
    { id: '4', type: 'sell', produce: 'Tomatoes', quantity: '50 kg', basePrice: 300, location: 'Ndola, Zambia', user: 'Grace', isMine: false },
    { id: '5', type: 'sell', produce: 'Onions', quantity: '500 kg', basePrice: 120, location: 'Livingstone, ZM', user: 'Banda', isMine: false },
    { id: '6', type: 'buy', produce: 'Soybeans', quantity: '10 Tons', basePrice: null, location: 'Kitwe, ZM', user: 'Global Feed Co', isMine: false },
  ]);

  const [newListing, setNewListing] = useState({ produce: '', quantity: '', price: '', location: '' });

  const handleAddListing = () => {
    if (!newListing.produce || !newListing.quantity) return;
    
    const parsedPrice = parseFloat(newListing.price);
    const basePrice = isNaN(parsedPrice) ? null : parsedPrice / country.rate;

    const listing: Listing = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'sell',
      produce: newListing.produce,
      quantity: newListing.quantity,
      basePrice: basePrice,
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
    l.produce.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (activeFilter === 'all' || l.type === activeFilter)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">AgriMarket</h2>
          <p className="text-neutral-500 font-medium">Empowering local trade and connectivity.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus size={20} className="mr-2" /> List Produce
        </button>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-neutral-100 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search produce (e.g., Maize, Cocoa, Soy)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-100 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none font-medium"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          <FilterButton active={view === 'browse'} onClick={() => setView('browse')} icon={<ShoppingBag size={16} />}>
            Marketplace
          </FilterButton>
          <FilterButton active={view === 'my_listings'} onClick={() => setView('my_listings')} icon={<CheckCircle2 size={16} />}>
            My Listings
          </FilterButton>
          <div className="w-px h-6 bg-neutral-200 mx-2 hidden lg:block"></div>
          <TagButton active={activeFilter === 'all'} onClick={() => setActiveFilter('all')}>All</TagButton>
          <TagButton active={activeFilter === 'sell'} onClick={() => setActiveFilter('sell')}>Sellers</TagButton>
          <TagButton active={activeFilter === 'buy'} onClick={() => setActiveFilter('buy')}>Buyers</TagButton>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
        <AnimatePresence mode="popLayout">
          {filteredListings.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 flex flex-col items-center justify-center text-neutral-400 bg-white rounded-[2rem] border-2 border-dashed border-neutral-100"
            >
              <ShoppingBag size={64} strokeWidth={1} className="mb-4 opacity-20" />
              <p className="text-lg font-bold">No markets found</p>
              <p className="text-sm">Try adjusting your search or filters.</p>
            </motion.div>
          ) : (
            filteredListings.map(listing => (
              <ListingCard 
                key={listing.id} 
                listing={listing} 
                formatCurrency={formatCurrency} 
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add Listing Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-[60]"
            />
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl pointer-events-auto relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
                
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-neutral-900">Post Availability</h3>
                    <p className="text-sm text-neutral-500 font-medium">Set your produce details for the market.</p>
                  </div>
                  <button onClick={() => setShowAddModal(false)} className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded-full text-neutral-500 transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-5">
                  <div className="group">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5 ml-1 block group-focus-within:text-emerald-600 transition-colors">Produce</label>
                    <input 
                      type="text" 
                      placeholder="e.g. White Maize, Organic Cocoa" 
                      value={newListing.produce}
                      onChange={e => setNewListing({...newListing, produce: e.target.value})}
                      className="w-full bg-neutral-50 border-2 border-transparent rounded-[1.25rem] p-4 text-sm focus:border-emerald-500 focus:bg-white outline-none transition-all font-semibold"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div className="group">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5 ml-1 block group-focus-within:text-emerald-600 transition-colors">Quantity</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 500kg" 
                        value={newListing.quantity}
                        onChange={e => setNewListing({...newListing, quantity: e.target.value})}
                        className="w-full bg-neutral-50 border-2 border-transparent rounded-[1.25rem] p-4 text-sm focus:border-emerald-500 focus:bg-white outline-none transition-all font-semibold"
                      />
                    </div>
                    <div className="group">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5 ml-1 block group-focus-within:text-emerald-600 transition-colors">Price (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="Negotiable" 
                        value={newListing.price}
                        onChange={e => setNewListing({...newListing, price: e.target.value})}
                        className="w-full bg-neutral-50 border-2 border-transparent rounded-[1.25rem] p-4 text-sm focus:border-emerald-500 focus:bg-white outline-none transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5 ml-1 block group-focus-within:text-emerald-600 transition-colors">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 pointer-events-none" size={18} />
                      <input 
                        type="text" 
                        placeholder="Enter City/Region" 
                        value={newListing.location}
                        onChange={e => setNewListing({...newListing, location: e.target.value})}
                        className="w-full bg-neutral-50 border-2 border-transparent rounded-[1.25rem] p-4 pl-12 text-sm focus:border-emerald-500 focus:bg-white outline-none transition-all font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleAddListing}
                  disabled={!newListing.produce || !newListing.quantity}
                  className="w-full bg-emerald-600 text-white font-bold py-4 rounded-[1.5rem] shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-30 mt-8 transition-all active:scale-95"
                >
                  Confirm Listing
                </button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterButton({ active, onClick, icon, children }: { active: boolean, onClick: () => void, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-2.5 rounded-2xl text-sm font-bold flex items-center space-x-2 transition-all ${
        active 
        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' 
        : 'text-neutral-500 hover:bg-neutral-100'
      }`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

function TagButton({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
        active 
        ? 'bg-neutral-900 border-neutral-900 text-white' 
        : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
      }`}
    >
      {children}
    </button>
  );
}

function ListingCard({ listing, formatCurrency }: { listing: Listing; formatCurrency: (p: number) => string; key?: string | number }) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white rounded-[2rem] p-6 shadow-sm border border-neutral-100 hover:shadow-xl hover:shadow-neutral-200/50 hover:-translate-y-1.5 transition-all group flex flex-col"
    >
      <div className="flex justify-between items-start mb-4">
        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${
          listing.type === 'buy' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
        }`}>
          {listing.type === 'buy' ? 'Wanted' : 'Available'}
        </span>
        <div className="text-right">
          <p className="text-xl font-black text-neutral-900">
            {listing.basePrice ? formatCurrency(listing.basePrice) : 'Negotiable'}
          </p>
          <p className="text-xs font-bold text-neutral-400">{listing.quantity}</p>
        </div>
      </div>

      <h3 className="text-xl font-bold text-neutral-800 mb-1 group-hover:text-emerald-700 transition-colors">{listing.produce}</h3>
      <p className="text-xs text-neutral-500 font-medium mb-6 flex items-center">
        <MapPin size={12} className="mr-1 inline" /> {listing.location}
      </p>

      <div className="mt-auto space-y-4">
        <div className="flex items-center space-x-3 bg-neutral-50 p-3 rounded-2xl">
          <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center overflow-hidden border border-white">
            <Store size={14} className="text-neutral-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-400 uppercase leading-none mb-0.5">Posted by</p>
            <p className="text-xs font-bold text-neutral-700">{listing.user}</p>
          </div>
        </div>

        {!listing.isMine && (
           <button className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center transition-all active:scale-95">
             Contact Interested Party
           </button>
        )}
      </div>
    </motion.div>
  );
}

