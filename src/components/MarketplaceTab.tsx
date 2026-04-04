import React, { useState } from 'react';
import { 
  Store, Plus, MapPin, Search, ShoppingBag, X, 
  TrendingUp, ArrowRight, Info, User, 
  Clock, Package, Tag, Filter, CheckCircle2, ChevronRight
} from 'lucide-react';
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
  description?: string;
  timestamp?: string;
};

const CATEGORIES = ['All', 'Grains', 'Vegetables', 'Fruits', 'Livestock', 'Tubers', 'Spices'];

export default function MarketplaceTab({ userRole }: { userRole: 'seller' | 'buyer' | 'agronomist' }) {
  const [view, setView] = useState<'browse' | 'my_listings'>('browse');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeFilter, setActiveFilter] = useState<'all' | 'sell' | 'buy'>('all');
  const { formatCurrency, country } = useCurrency();

  const [listings, setListings] = useState<Listing[]>([
    { 
      id: '1', type: 'buy', produce: 'Maize', quantity: '5 Tons', basePrice: null, 
      location: 'Lusaka, Zambia', user: 'AgriCorp Buyers', isMine: false,
      description: 'Looking for high-quality white maize. Moisture content should be below 13.5%. Preference for bulk suppliers.',
      timestamp: '2 hours ago'
    },
    { 
      id: '2', type: 'sell', produce: 'Cocoa Beans', quantity: '200 kg', basePrice: 60, 
      location: 'Abidjan, CI', user: 'Kouame', isMine: false,
      description: 'Grade A cocoa beans, sun-dried and fermented. Ready for immediate export or local processing.',
      timestamp: '5 hours ago'
    },
    { 
      id: '3', type: 'buy', produce: 'Cashew Nuts', quantity: '1 Ton', basePrice: null, 
      location: 'Bouaké, CI', user: 'Export Co.', isMine: false,
      description: 'Raw cashew nuts (RCN) wanted. Minimum KOR 48.',
      timestamp: '1 day ago'
    },
    { 
      id: '4', type: 'sell', produce: 'Tomatoes', quantity: '50 kg', basePrice: 300, 
      location: 'Ndola, Zambia', user: 'Grace', isMine: false,
      description: 'Fresh Roma tomatoes, harvested this morning. Multiple crates available.',
      timestamp: '30 mins ago'
    },
    { 
      id: '5', type: 'sell', produce: 'Onions', quantity: '500 kg', basePrice: 120, 
      location: 'Livingstone, ZM', user: 'Banda', isMine: false,
      description: 'Red onions available in 10kg bags. Excellent shelf life.',
      timestamp: '6 hours ago'
    },
    { 
      id: '6', type: 'buy', produce: 'Soybeans', quantity: '10 Tons', basePrice: null, 
      location: 'Kitwe, ZM', user: 'Global Feed Co', isMine: false,
      description: 'Non-GMO soybeans for poultry feed production. Regular monthly contract available.',
      timestamp: '3 hours ago'
    },
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
      isMine: true,
      timestamp: 'Just now'
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

  const hotDemands = filteredListings.filter(l => l.type === 'buy');
  const recentSupplies = filteredListings.filter(l => l.type === 'sell');

  return (
    <div className="space-y-8 pb-20">
      {/* Header & Insights */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black text-neutral-900 tracking-tight">AgriMarket</h2>
            <p className="text-neutral-500 font-medium">Real-time trade & product insights.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-8 rounded-2xl shadow-xl shadow-emerald-600/20 flex items-center justify-center transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={20} className="mr-2" /> List Produce
          </button>
        </div>

        {/* Insights Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 bg-white/20 w-fit px-4 py-1.5 rounded-full backdrop-blur-md">
                <TrendingUp size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Demand Insights</span>
              </div>
              <h3 className="text-3xl font-black mb-2">Maize is in High Demand</h3>
              <p className="text-indigo-100 mb-6 max-w-md font-medium">Demand for White Maize is up <span className="font-black text-white">12%</span> this week in your region. Local buyers are seeking immediate supply.</p>
              <button className="bg-white text-indigo-700 px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-50 transition-colors">
                View Demands <ArrowRight size={18} />
              </button>
            </div>
            {/* Abstract Background Design */}
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl"></div>
          </div>
          
          <div className="bg-amber-50 border border-amber-100 rounded-[2.5rem] p-8 flex flex-col justify-center">
            <div className="p-3 bg-amber-400 w-fit rounded-2xl text-white mb-4 shadow-lg shadow-amber-200">
              <Info size={24} />
            </div>
            <h4 className="text-xl font-bold text-amber-900 mb-2">Pricing Alert</h4>
            <p className="text-sm text-amber-700 font-medium italic">"Current market trends suggest Cocoa prices may peak by Friday. Consider listing late-harvest stock now."</p>
          </div>
        </div>
      </div>

      {/* Control Bar & Categories */}
      <div className="space-y-4">
        <div className="bg-white p-3 rounded-[2rem] shadow-sm border border-neutral-100 flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search produce..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-50 border-none rounded-[1.25rem] py-4 pl-14 pr-4 text-sm focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all outline-none font-semibold text-neutral-800"
            />
          </div>
          <div className="flex gap-2">
             <FilterButton active={activeFilter === 'all'} onClick={() => setActiveFilter('all')}>All</FilterButton>
             <FilterButton active={activeFilter === 'sell'} onClick={() => setActiveFilter('sell')}>Supplies</FilterButton>
             <FilterButton active={activeFilter === 'buy'} onClick={() => setActiveFilter('buy')}>Demands</FilterButton>
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                activeCategory === cat 
                ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-200' 
                : 'bg-white border border-neutral-100 text-neutral-500 hover:border-neutral-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Themed Sections */}
      <div className="space-y-12">
        {/* Hot Demands */}
        {hotDemands.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-amber-500 rounded-full"></div>
                <h3 className="text-2xl font-black text-neutral-900">Hot Demands</h3>
              </div>
              <button className="text-amber-600 text-sm font-bold flex items-center gap-1 hover:underline">
                View all <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotDemands.map(listing => (
                <ListingCard 
                  key={listing.id} 
                  listing={listing} 
                  formatCurrency={formatCurrency} 
                  onView={() => setSelectedListing(listing)}
                />
              ))}
            </div>
          </section>
        )}

        {/* New Supplies */}
        {recentSupplies.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-emerald-500 rounded-full"></div>
                <h3 className="text-2xl font-black text-neutral-900">Recent Supplies</h3>
              </div>
              <button className="text-emerald-600 text-sm font-bold flex items-center gap-1 hover:underline">
                View all <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentSupplies.map(listing => (
                <ListingCard 
                  key={listing.id} 
                  listing={listing} 
                  formatCurrency={formatCurrency} 
                  onView={() => setSelectedListing(listing)}
                />
              ))}
            </div>
          </section>
        )}
        
        {filteredListings.length === 0 && (
           <div className="py-20 flex flex-col items-center justify-center text-neutral-400 bg-white rounded-[3rem] border-2 border-dashed border-neutral-100">
             <ShoppingBag size={64} strokeWidth={1} className="mb-4 opacity-20" />
             <p className="text-lg font-bold">No markets found</p>
             <p className="text-sm">Try adjusting your search or filters.</p>
           </div>
        )}
      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {selectedListing && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedListing(null)}
              className="fixed inset-0 bg-neutral-900/80 backdrop-blur-md z-[80]"
            />
            <div className="fixed inset-4 z-[90] flex items-center justify-center pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl pointer-events-auto flex flex-col max-h-[90vh]"
              >
                <div className="p-8 pb-4 flex justify-between items-start">
                  <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                    selectedListing.type === 'buy' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {selectedListing.type === 'buy' ? 'Wanted' : 'Available'}
                  </div>
                  <button onClick={() => setSelectedListing(null)} className="p-3 bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="px-10 pb-10 space-y-8 overflow-y-auto">
                  <div className="space-y-4">
                    <h3 className="text-4xl font-black text-neutral-900 leading-tight">{selectedListing.produce}</h3>
                    <div className="flex flex-wrap gap-4">
                      <div className="bg-neutral-50 px-4 py-2 rounded-2xl flex items-center gap-2">
                        <Tag size={16} className="text-emerald-600" />
                        <span className="text-sm font-bold text-neutral-700">
                          {selectedListing.basePrice ? formatCurrency(selectedListing.basePrice) : 'Negotiable'}
                        </span>
                      </div>
                      <div className="bg-neutral-50 px-4 py-2 rounded-2xl flex items-center gap-2">
                        <Package size={16} className="text-indigo-600" />
                        <span className="text-sm font-bold text-neutral-700">{selectedListing.quantity}</span>
                      </div>
                      <div className="bg-neutral-50 px-4 py-2 rounded-2xl flex items-center gap-2">
                        <MapPin size={16} className="text-rose-600" />
                        <span className="text-sm font-bold text-neutral-700">{selectedListing.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-50 p-6 rounded-[2rem] space-y-3">
                    <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">Listing Description</p>
                    <p className="text-neutral-700 leading-relaxed font-medium">
                      {selectedListing.description || "No additional description provided for this listing."}
                    </p>
                  </div>

                  <div className="bg-neutral-900 rounded-[2rem] p-8 text-white flex items-center justify-between shadow-xl shadow-neutral-300">
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                          <User size={28} />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-white/50 uppercase tracking-widest leading-none mb-1">Posted by</p>
                          <p className="text-xl font-black">{selectedListing.user}</p>
                          <p className="text-xs text-white/40 italic">{selectedListing.timestamp}</p>
                       </div>
                    </div>
                    {!selectedListing.isMine && (
                      <button className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 px-8 rounded-2xl transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
                         Contact Seller
                      </button>
                    )}
                  </div>

                  <p className="text-center text-xs text-neutral-400 font-medium">Your contact details are hidden from public view until you choose to reveal them.</p>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Add Listing Modal (Keeping simplified but updated styling) */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-[100]"
            />
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl pointer-events-auto relative overflow-hidden"
              >
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-3xl font-black text-neutral-900 tracking-tight">New Market Listing</h3>
                    <p className="text-sm text-neutral-500 font-medium">Connect with buyers and sellers instantly.</p>
                  </div>
                  <button onClick={() => setShowAddModal(false)} className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded-full text-neutral-500 transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-2 block px-1">Produce Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. White Maize, Organic Tomatoes" 
                      value={newListing.produce}
                      onChange={e => setNewListing({...newListing, produce: e.target.value})}
                      className="w-full bg-neutral-50 border-2 border-transparent rounded-[1.25rem] p-4 text-sm focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold placeholder:text-neutral-300"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-2 block px-1">Quantity</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 500kg" 
                        value={newListing.quantity}
                        onChange={e => setNewListing({...newListing, quantity: e.target.value})}
                        className="w-full bg-neutral-50 border-2 border-transparent rounded-[1.25rem] p-4 text-sm focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold placeholder:text-neutral-300"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-2 block px-1">Asking Price</label>
                      <input 
                        type="text" 
                        placeholder="Negotiable" 
                        value={newListing.price}
                        onChange={e => setNewListing({...newListing, price: e.target.value})}
                        className="w-full bg-neutral-50 border-2 border-transparent rounded-[1.25rem] p-4 text-sm focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold placeholder:text-neutral-300"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleAddListing}
                    disabled={!newListing.produce || !newListing.quantity}
                    className="w-full bg-neutral-900 text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-neutral-800 disabled:opacity-20 mt-4 transition-all active:scale-95"
                  >
                    Post Listing
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ListingCardProps {
  key?: React.Key;
  listing: Listing;
  formatCurrency: (p: number) => string;
  onView: () => void;
}

function ListingCard({ listing, formatCurrency, onView }: ListingCardProps) {
  const isDemand = listing.type === 'buy';
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2.5rem] p-3 shadow-sm border border-neutral-100 hover:shadow-2xl hover:shadow-neutral-200/50 hover:-translate-y-2 transition-all group flex flex-col overflow-hidden h-full"
    >
      {/* Visual Header / Icon Area */}
      <div className={`rounded-[2rem] p-8 flex items-center justify-center mb-5 transition-transform group-hover:scale-105 duration-500 relative ${
        isDemand ? 'bg-amber-50' : 'bg-emerald-50'
      }`}>
        <div className={`p-4 rounded-3xl ${isDemand ? 'bg-amber-400 text-white shadow-xl shadow-amber-200' : 'bg-emerald-500 text-white shadow-xl shadow-emerald-200'}`}>
          <ShoppingBag size={40} />
        </div>
        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1">
          <Clock size={10} className="text-neutral-400" />
          <span className="text-[10px] font-black text-neutral-500 uppercase">{listing.timestamp}</span>
        </div>
      </div>

      <div className="px-5 pb-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-2xl font-black text-neutral-800 tracking-tight group-hover:text-emerald-700 transition-colors uppercase">{listing.produce}</h3>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
           <div className="bg-neutral-50 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
             <Tag size={12} className="text-neutral-400" />
             <span className="text-[11px] font-black text-neutral-600">
               {listing.basePrice ? formatCurrency(listing.basePrice) : 'Negotiable'}
             </span>
           </div>
           <div className="bg-neutral-50 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
             <MapPin size={12} className="text-neutral-400" />
             <span className="text-[11px] font-black text-neutral-600">{listing.location.split(',')[0]}</span>
           </div>
        </div>

        <button 
          onClick={onView}
          className="mt-auto w-full group/btn relative overflow-hidden bg-neutral-900 text-white px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all active:scale-95"
        >
          <span className="relative z-10">{isDemand ? 'Supply Market' : 'Purchase Info'}</span>
          <ArrowRight size={16} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
        active 
        ? 'bg-neutral-900 text-white shadow-xl shadow-neutral-300' 
        : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50'
      }`}
    >
      {children}
    </button>
  );
}

