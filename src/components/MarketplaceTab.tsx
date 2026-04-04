import React, { useState } from 'react';
import { 
  Plus, MapPin, ShoppingBag, X, 
  TrendingUp, ArrowRight, Info, User, 
  Clock, Package, Tag, ChevronRight, CheckCircle2,
  Sprout, Calendar, List, Store
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
  country: string;
  region: string;
  district: string;
  user: string;
  isMine: boolean;
  image?: string;
  description?: string;
  timestamp?: string;
  harvestType?: 'immediate' | 'pre_harvest';
  growingPeriod?: string;
  startDate?: string;
  expectedHarvest?: string;
};

const CATEGORIES = ['All', 'Grains', 'Vegetables', 'Fruits', 'Livestock', 'Tubers', 'Spices'];

const LOCATION_DATA: Record<string, Record<string, string[]>> = {
  'ZM': {
    'Southern': ['Choma', 'Livingstone', 'Monze', 'Mazabuka'],
    'Lusaka': ['Lusaka District', 'Chongwe', 'Kafue'],
    'Copperbelt': ['Kitwe', 'Ndola', 'Chingola'],
  },
  'CI': {
     'Lagunes': ['Abidjan', 'Dabou', 'Grand-Lahou'],
     'Vallée du Bandama': ['Bouaké', 'Katiola'],
  },
  'BW': {
     'South-East': ['Gaborone', 'Ramotswa'],
     'North-West': ['Maun', 'Kasane'],
  }
};

export default function MarketplaceTab({ userRole }: { userRole: 'seller' | 'buyer' | 'agronomist' }) {
  const [view, setView] = useState<'browse' | 'my_listings' | 'demands'>('browse');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeFilter, setActiveFilter] = useState<'all' | 'sell' | 'buy'>('all');
  const { formatCurrency, country } = useCurrency();

  const [listings, setListings] = useState<Listing[]>([
    { 
      id: '1', type: 'buy', produce: 'Maize', quantity: '5 Tons', basePrice: null, 
      location: 'Lusaka, Zambia', country: 'ZM', region: 'Lusaka', district: 'Lusaka District', user: 'AgriCorp Buyers', isMine: false,
      description: 'Looking for high-quality white maize. Moisture content should be below 13.5%. Preference for bulk suppliers.',
      timestamp: '2 hours ago'
    },
    { 
      id: '2', type: 'sell', produce: 'Cocoa Beans', quantity: '200 kg', basePrice: 60, 
      location: 'Abidjan, CI', country: 'CI', region: 'Lagunes', district: 'Abidjan', user: 'Kouame', isMine: false,
      description: 'Grade A cocoa beans, sun-dried and fermented. Ready for immediate export or local processing.',
      timestamp: '5 hours ago'
    },
    { 
      id: '3', type: 'buy', produce: 'Cashew Nuts', quantity: '1 Ton', basePrice: null, 
      location: 'Bouaké, CI', country: 'CI', region: 'Vallée du Bandama', district: 'Bouaké', user: 'Export Co.', isMine: false,
      description: 'Raw cashew nuts (RCN) wanted. Minimum KOR 48.',
      timestamp: '1 day ago'
    },
    { 
      id: '4', type: 'sell', produce: 'Tomatoes', quantity: '50 kg', basePrice: 300, 
      location: 'Ndola, Zambia', country: 'ZM', region: 'Copperbelt', district: 'Ndola', user: 'Grace', isMine: false,
      description: 'Fresh Roma tomatoes, harvested this morning. Multiple crates available.',
      timestamp: '30 mins ago'
    },
    { 
      id: '5', type: 'sell', produce: 'Onions', quantity: '500 kg', basePrice: 120, 
      location: 'Livingstone, ZM', country: 'ZM', region: 'Southern', district: 'Livingstone', user: 'Banda', isMine: false,
      description: 'Red onions available in 10kg bags. Excellent shelf life.',
      timestamp: '6 hours ago'
    },
    { 
      id: '6', type: 'buy', produce: 'Soybeans', quantity: '10 Tons', basePrice: null, 
      location: 'Kitwe, ZM', country: 'ZM', region: 'Copperbelt', district: 'Kitwe', user: 'Global Feed Co', isMine: false,
      description: 'Non-GMO soybeans for poultry feed production. Regular monthly contract available.',
      timestamp: '3 hours ago'
    },
    { 
      id: '7', type: 'sell', produce: 'Sugar Snaps', quantity: '200 kg', basePrice: 450, 
      location: 'Choma, ZM', country: 'ZM', region: 'Southern', district: 'Choma', user: 'Green Valley', isMine: false,
      harvestType: 'pre_harvest',
      growingPeriod: '65 Days',
      startDate: 'Oct 15, 2026',
      expectedHarvest: 'Dec 20, 2026',
      description: 'Pre-order now for the December harvest. High export quality.',
      timestamp: 'Just now'
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
      location: `${newListing.location || 'Local District'}, ${country.name}`,
      country: country.code,
      region: 'My Region',
      district: newListing.location || 'Local District',
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
    (selectedCountryCode === 'All' || l.country === selectedCountryCode) &&
    (selectedRegion === 'All' || l.region === selectedRegion) &&
    (selectedDistrict === 'All' || l.district === selectedDistrict) &&
    (activeFilter === 'all' || l.type === activeFilter)
  );

  const availableRegions = selectedCountryCode !== 'All' ? Object.keys(LOCATION_DATA[selectedCountryCode] || {}) : [];
  const availableDistricts = (selectedCountryCode !== 'All' && selectedRegion !== 'All') ? (LOCATION_DATA[selectedCountryCode][selectedRegion] || []) : [];

  const hotDemands = filteredListings.filter(l => l.type === 'buy');
  const recentSupplies = filteredListings.filter(l => l.type === 'sell');

  return (
    <div className="space-y-8 pb-20">
      <AnimatePresence mode="wait">
        {view === 'demands' ? (
          <DemandTrendsView 
            onBack={() => setView('browse')} 
            formatCurrency={formatCurrency}
          />
        ) : view === 'all_supplies' || view === 'all_demands' ? (
          <AllListingsTable 
            type={view === 'all_supplies' ? 'sell' : 'buy'}
            listings={filteredListings}
            onBack={() => setView('browse')}
            onView={(l) => setSelectedListing(l)}
            formatCurrency={formatCurrency}
          />
        ) : (
          <motion.div 
            key="market"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
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
                      <span className="text-xs font-bold uppercase tracking-wider">AI Demand Insights</span>
                    </div>
                    <h3 className="text-3xl font-black mb-2">
                      {selectedDistrict !== 'All' ? `${selectedDistrict} Demand is Up` : 
                       selectedRegion !== 'All' ? `${selectedRegion} Market Trends` : 
                       'Maize is in High Demand'}
                    </h3>
                    <p className="text-indigo-100 mb-6 max-w-md font-medium">
                      {selectedDistrict !== 'All' 
                        ? `In ${selectedDistrict}, demand for White Maize has peaked by 12% this week. Local buyers are ready.` 
                        : `Trade signals show rising demand in your region. Consider listing your harvest to reach active buyers.`}
                    </p>
                    <button 
                      onClick={() => setView('demands')}
                      className="bg-white text-indigo-700 px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-50 transition-colors active:scale-95 shadow-lg shadow-indigo-900/20"
                    >
                      View Demands <ArrowRight size={18} />
                    </button>
                  </div>
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

            {/* Control Bar & Hierarchical Locations */}
            <div className="space-y-4">
              <div className="bg-white p-3 rounded-[2rem] shadow-sm border border-neutral-100 flex flex-col lg:flex-row items-center gap-3">
                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="relative">
                    <select 
                      value={selectedCountryCode}
                      onChange={(e) => {
                        setSelectedCountryCode(e.target.value);
                        setSelectedRegion('All');
                        setSelectedDistrict('All');
                      }}
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3.5 pl-4 pr-10 text-xs font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none text-neutral-600"
                    >
                      <option value="All">All Countries</option>
                      <option value="ZM">🇿🇲 Zambia</option>
                      <option value="CI">🇨🇮 Côte d'Ivoire</option>
                      <option value="BW">🇧🇼 Botswana</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                      <ChevronRight size={14} className="rotate-90" />
                    </div>
                  </div>

                  <div className={`relative transition-opacity ${selectedCountryCode === 'All' ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                    <select 
                      value={selectedRegion}
                      onChange={(e) => {
                        setSelectedRegion(e.target.value);
                        setSelectedDistrict('All');
                      }}
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3.5 pl-4 pr-10 text-xs font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none text-neutral-600"
                    >
                      <option value="All">All Regions</option>
                      {availableRegions.map(reg => <option key={reg} value={reg}>{reg}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                      <ChevronRight size={14} className="rotate-90" />
                    </div>
                  </div>

                  <div className={`relative transition-opacity ${selectedRegion === 'All' ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                    <select 
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full bg-neutral-50 border-none rounded-2xl py-3.5 pl-4 pr-10 text-xs font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none text-neutral-600"
                    >
                      <option value="All">All Districts</option>
                      {availableDistricts.map(dist => <option key={dist} value={dist}>{dist}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                      <ChevronRight size={14} className="rotate-90" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
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
              {hotDemands.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-8 bg-amber-500 rounded-full"></div>
                      <h3 className="text-2xl font-black text-neutral-900">Hot Demands</h3>
                    </div>
                    <button 
                      onClick={() => setView('all_demands')}
                      className="text-amber-600 text-sm font-bold flex items-center gap-1 hover:underline"
                    >
                      View all <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {hotDemands.map(listing => (
                      <ListingCard 
                        listing={listing} 
                        formatCurrency={formatCurrency} 
                        onView={() => setSelectedListing(listing)}
                        key={listing.id} 
                      />
                    ))}
                  </div>
                </section>
              )}

              {recentSupplies.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-8 bg-emerald-500 rounded-full"></div>
                      <h3 className="text-2xl font-black text-neutral-900">Recent Supplies</h3>
                    </div>
                    <button 
                      onClick={() => setView('all_supplies')}
                      className="text-emerald-600 text-sm font-bold flex items-center gap-1 hover:underline"
                    >
                      View all <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {recentSupplies.map(listing => (
                      <ListingCard 
                        listing={listing} 
                        formatCurrency={formatCurrency} 
                        onView={() => setSelectedListing(listing)}
                        key={listing.id} 
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
          </motion.div>
        )}
      </AnimatePresence>

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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="flex flex-col gap-1 px-4 py-3 bg-neutral-50 rounded-2xl">
                          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Type</span>
                          <span className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                             {selectedListing.type === 'buy' ? <Tag size={14} className="text-amber-600" /> : <Store size={14} className="text-emerald-600" />}
                             {selectedListing.harvestType === 'pre_harvest' ? 'Future Harvest' : selectedListing.type === 'buy' ? 'Wanted' : 'Available'}
                          </span>
                       </div>
                       <div className="flex flex-col gap-1 px-4 py-3 bg-neutral-50 rounded-2xl">
                          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Qty Required</span>
                          <span className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                             <Package size={14} className="text-indigo-600" />
                             {selectedListing.quantity}
                          </span>
                       </div>
                       <div className="flex flex-col gap-1 px-4 py-3 bg-neutral-50 rounded-2xl">
                          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">1st Asking Price</span>
                          <span className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                             <Tag size={14} className="text-emerald-600" />
                             {selectedListing.basePrice ? formatCurrency(selectedListing.basePrice) : 'Negotiable'}
                          </span>
                       </div>
                       <div className="flex flex-col gap-1 px-4 py-3 bg-neutral-50 rounded-2xl">
                          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Delivery Location</span>
                          <span className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                             <MapPin size={14} className="text-rose-600" />
                             {selectedListing.location}
                          </span>
                       </div>
                    </div>

                    {selectedListing.harvestType === 'pre_harvest' && (
                      <div className="p-1 bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 rounded-[2.2rem]">
                        <div className="bg-white rounded-[2rem] p-6 grid grid-cols-1 md:grid-cols-3 gap-4 border border-emerald-100">
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Growing Period</span>
                            <span className="text-xs font-bold text-neutral-700 flex items-center gap-2">
                              <Sprout size={14} className="text-emerald-600" />
                              {selectedListing.growingPeriod}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Start Date</span>
                            <span className="text-xs font-bold text-neutral-700 flex items-center gap-2">
                              <Calendar size={14} className="text-indigo-600" />
                              {selectedListing.startDate}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Expected Harvest</span>
                            <span className="text-xs font-bold text-neutral-700 flex items-center gap-2">
                              <CheckCircle2 size={14} className="text-emerald-600" />
                              {selectedListing.expectedHarvest}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
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
                  <p className="text-center text-xs text-neutral-400 font-medium pb-4">Your contact details are hidden from public view until you choose to reveal them.</p>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Add Listing Modal */}
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

function ListingCard({ listing, formatCurrency, onView }: { 
  listing: Listing, 
  formatCurrency: (p: number) => string, 
  onView: () => void,
  key?: React.Key
}) {
  const isDemand = listing.type === 'buy';
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2rem] p-2.5 shadow-sm border border-neutral-100 hover:shadow-2xl hover:shadow-neutral-200/50 hover:-translate-y-2 transition-all group flex flex-col overflow-hidden h-full"
    >
      <div className={`rounded-[1.5rem] p-4 flex items-center justify-center mb-4 transition-transform group-hover:scale-105 duration-500 relative ${
        isDemand ? 'bg-amber-50' : 'bg-emerald-50'
      }`}>
        <div className={`p-4 rounded-3xl ${isDemand ? 'bg-amber-400 text-white shadow-xl shadow-amber-200' : 'bg-emerald-500 text-white shadow-xl shadow-emerald-200'}`}>
          <ShoppingBag size={24} />
        </div>
        <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1">
          <Clock size={8} className="text-neutral-400" />
          <span className="text-[8px] font-black text-neutral-500 uppercase">{listing.timestamp}</span>
        </div>
      </div>

      <div className="px-3 pb-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-black text-neutral-800 tracking-tight group-hover:text-emerald-700 transition-colors uppercase leading-tight line-clamp-1">{listing.produce}</h3>
        </div>
        
        <div className="flex flex-wrap gap-1.5 mb-4">
           <div className="bg-neutral-50 px-2 py-1 rounded-lg flex items-center gap-1">
             <Tag size={10} className="text-neutral-400" />
             <span className="text-[9px] font-black text-neutral-600">
               {listing.basePrice ? formatCurrency(listing.basePrice) : 'Negotiable'}
             </span>
           </div>
           <div className="bg-neutral-50 px-2 py-1 rounded-lg flex items-center gap-1">
             <MapPin size={10} className="text-neutral-400" />
             <span className="text-[9px] font-black text-neutral-600">{listing.district}</span>
           </div>
        </div>

        <button 
          onClick={onView}
          className="mt-auto w-full group/btn relative overflow-hidden bg-neutral-900 text-white px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all active:scale-95"
        >
          <span className="relative z-10">{isDemand ? 'Supply Market' : 'Purchase Info'}</span>
          <ArrowRight size={12} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
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

function AllListingsTable({ type, listings, onBack, onView, formatCurrency }: { 
  type: 'sell' | 'buy', 
  listings: Listing[], 
  onBack: () => void, 
  onView: (l: Listing) => void,
  formatCurrency: (v: number) => string,
  key?: React.Key
}) {
  const filtered = listings.filter(l => l.type === type);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 bg-white border border-neutral-100 rounded-2xl hover:bg-neutral-50 transition-all shadow-sm group"
          >
            <ChevronRight size={24} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h2 className="text-3xl font-black text-neutral-900 tracking-tight">
              {type === 'sell' ? 'All Supplies' : 'All Demands'}
            </h2>
            <p className="text-neutral-500 font-medium italic">Viewing {filtered.length} active listings</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-xl shadow-neutral-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-50 bg-neutral-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Produce</th>
                <th className="px-8 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Quantity</th>
                <th className="px-8 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Price</th>
                <th className="px-8 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Location</th>
                <th className="px-8 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Posted</th>
                <th className="px-8 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${type === 'sell' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        <ShoppingBag size={16} />
                      </div>
                      <span className="text-base font-black text-neutral-800">{item.produce}</span>
                      {item.harvestType === 'pre_harvest' && <Sprout size={14} className="text-emerald-500" title="Future Harvest" />}
                    </div>
                  </td>
                  <td className="px-8 py-6 font-bold text-neutral-600">{item.quantity}</td>
                  <td className="px-8 py-6 font-bold text-neutral-900">
                    {item.basePrice ? formatCurrency(item.basePrice) : 'Negotiable'}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-1.5 text-neutral-500 font-medium">
                      <MapPin size={12} className="text-rose-500" />
                      <span className="text-xs">{item.district}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs text-neutral-400 font-medium">{item.timestamp}</td>
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => onView(item)}
                      className="p-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-all active:scale-90"
                    >
                      <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function DemandTrendsView({ onBack, formatCurrency }: { 
  onBack: () => void, 
  formatCurrency: (v: number) => string,
  key?: React.Key
}) {
  const trends = [
    { id: 1, product: 'White Maize', price: 280, avg7d: 245, status: 'low', trend: [240, 242, 250, 245, 260, 275, 280] },
    { id: 2, product: 'Cocoa Beans', price: 6200, avg7d: 6450, status: 'flooded', trend: [6600, 6550, 6500, 6400, 6300, 6250, 6200] },
    { id: 3, product: 'Cashew Nuts', price: 1250, avg7d: 1240, status: 'available', trend: [1230, 1235, 1245, 1240, 1242, 1255, 1250] },
    { id: 4, product: 'Soybeans', price: 410, avg7d: 380, status: 'low', trend: [370, 375, 385, 380, 395, 405, 410] },
    { id: 5, product: 'Roma Tomatoes', price: 45, avg7d: 85, status: 'flooded', trend: [95, 90, 80, 70, 60, 50, 45] },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 bg-white border border-neutral-100 rounded-2xl hover:bg-neutral-50 transition-all shadow-sm group"
          >
            <ChevronRight size={24} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h2 className="text-3xl font-black text-neutral-900 tracking-tight">Market Demand Analysis</h2>
            <p className="text-neutral-500 font-medium italic">7-Day strategic trade insights</p>
          </div>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 px-6 py-3 rounded-2xl hidden md:flex items-center gap-2">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-black text-indigo-700 uppercase tracking-widest">Live AI Monitoring</span>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-xl shadow-neutral-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-50 bg-neutral-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Product</th>
                <th className="px-8 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Current Price</th>
                <th className="px-8 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">7-Day Avg</th>
                <th className="px-8 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Trends</th>
                <th className="px-8 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Sentiment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {trends.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                        <Package size={20} />
                      </div>
                      <span className="text-base font-black text-neutral-800">{item.product}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-bold text-neutral-900">{formatCurrency(item.price)}</td>
                  <td className="px-8 py-6 font-bold text-neutral-500">{formatCurrency(item.avg7d)}</td>
                  <td className="px-8 py-6">
                    <Sparkline data={item.trend} color={item.status === 'flooded' ? '#fb7185' : '#10b981'} />
                  </td>
                  <td className="px-8 py-6">
                    <StatusBadge status={item.status as any} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100">
           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Traders Recommendation</p>
           <p className="text-sm font-bold text-emerald-900 leading-relaxed">Consider selling Maize and Soybeans today. Prices are 10%+ above 7-day averages.</p>
        </div>
        <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100">
           <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">AI Forecasting</p>
           <p className="text-sm font-bold text-indigo-900 leading-relaxed">Tomatoes are experiencing a local flood. Hold supply if possible; demand expected to rebound in 3 days.</p>
        </div>
        <button 
          onClick={onBack}
          className="bg-neutral-900 text-white rounded-3xl p-6 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-neutral-800 transition-all group"
        >
          Return to Marketplace <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}

function Sparkline({ data, color }: { data: number[], color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 100;
  const height = 30;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function StatusBadge({ status }: { status: 'flooded' | 'low' | 'available' }) {
  const configs = {
    flooded: { color: 'bg-rose-50 text-rose-600 border-rose-100', label: 'Flooded' },
    low: { color: 'bg-amber-50 text-amber-600 border-amber-100', label: 'High Demand' },
    available: { color: 'bg-emerald-50 text-emerald-600 border-emerald-100', label: 'Stable' }
  };
  const config = configs[status];
  return (
    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${config.color}`}>
      {config.label}
    </span>
  );
}
