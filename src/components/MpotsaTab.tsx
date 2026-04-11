import React, { useState } from 'react';
import { HelpCircle, Search, BookOpen, MessageCircle, ArrowRight, Shield, Heart, GraduationCap, Briefcase, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function MpotsaTab() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  const categories = [
    { name: 'Health', icon: <Heart size={16} />, color: 'bg-rose-100 text-rose-700' },
    { name: 'Legal', icon: <Shield size={16} />, color: 'bg-indigo-100 text-indigo-700' },
    { name: 'Education', icon: <GraduationCap size={16} />, color: 'bg-amber-100 text-amber-700' },
    { name: 'Jobs', icon: <Briefcase size={16} />, color: 'bg-emerald-100 text-emerald-700' }
  ];

  const featuredQA = [
    {
      q: "What are the common pests for maize in Southern Africa?",
      a: "The most common pests include Fall Armyworm, Maize Stalk Borer, and Leaf Aphids. Early detection is key to prevention.",
      category: "Education"
    },
    {
      q: "How do I register my small-scale farm for government subsidies?",
      a: "Contact your local Ministry of Agriculture office with your NRC and proof of land ownership for FISP registration.",
      category: "Legal"
    }
  ];

  const handleAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setAnswer(null);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `[Mpotsa Q&A] User is asking about ${activeCategory}: ${query}` }]
        })
      });
      const data = await response.json();
      setAnswer(data.content || 'No answer found.');
    } catch (e) {
      console.error('Mpotsa Ask Error:', e);
      setAnswer('Sorry, the expert system is currently offline.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-4xl font-black text-neutral-900 font-outfit tracking-tighter uppercase">
          Mpotsa Q&A Engine
        </h2>
        <p className="text-neutral-500 font-medium leading-relaxed">
          Ask anything about health, legal, education, or jobs. Our AI and expert knowledge base are here to provide instant answers.
        </p>
      </div>

      {/* Hero Search */}
      <div className="relative max-w-3xl mx-auto w-full group">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-[2rem] blur opacity-20 group-focus-within:opacity-40 transition-opacity"></div>
        <div className="relative flex items-center bg-white border border-neutral-200 rounded-3xl p-2 shadow-xl shadow-emerald-950/5">
          <div className="flex-1 flex items-center px-4">
            <Search className="text-neutral-400 mr-3" size={24} />
            <input 
              type="text" 
              placeholder="Ask a question (e.g. 'How to cure maize rust?')"
              className="w-full py-4 text-lg font-medium outline-none text-neutral-800 placeholder:text-neutral-400"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            />
          </div>
          <button 
            disabled={loading}
            onClick={handleAsk}
            className="bg-emerald-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-800 transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : (
              <>
                <span>Ask Now</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {answer && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-3xl mx-auto w-full bg-white border-2 border-emerald-100 rounded-[2rem] p-8 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <Sparkles size={48} className="text-emerald-600" />
            </div>
            <div className="flex items-center gap-2 mb-4 text-emerald-600 font-bold text-xs uppercase tracking-widest">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               Expert AI Assessment
            </div>
            <p className="text-neutral-800 text-lg font-medium leading-relaxed">
               {answer}
            </p>
            <div className="mt-6 flex items-center gap-4 text-neutral-400 text-[10px] font-bold uppercase">
               <span>Generated by Pameltex Tech mARI AI</span>
               <div className="w-1 h-1 rounded-full bg-neutral-200" />
               <span>Instant Q&A</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-3">
        <button 
          onClick={() => setActiveCategory('All')}
          className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
            activeCategory === 'All' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 border border-neutral-200'
          }`}
        >
          All Topics
        </button>
        {categories.map(cat => (
          <button 
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
              activeCategory === cat.name ? 'bg-emerald-600 text-white' : 'bg-white text-neutral-600 border border-neutral-200'
            }`}
          >
            {cat.icon}
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {featuredQA.map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-[2rem] p-8 shadow-sm border border-neutral-200 hover:border-emerald-200 transition-all group"
          >
            <div className={`w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 ${
              categories.find(c => c.name === item.category)?.color || 'bg-neutral-100 text-neutral-700'
            }`}>
              {item.category}
            </div>
            <h4 className="text-xl font-bold text-neutral-900 mb-4 font-outfit group-hover:text-emerald-700 transition-colors">
              "{item.q}"
            </h4>
            <div className="flex space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-xs">
                A
              </div>
              <p className="text-neutral-600 text-sm leading-relaxed font-medium">
                {item.a}
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between pt-6 border-t border-neutral-50 text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">
              <span>Verified Answer</span>
              <button className="text-emerald-600 hover:text-emerald-700 flex items-center space-x-1">
                <span>View Full Details</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Tips */}
      <div className="bg-emerald-50 rounded-[2.5rem] p-10 border border-emerald-100 flex flex-col md:flex-row items-center gap-8 shadow-sm">
        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-emerald-900/5">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-200">
            <BookOpen size={32} />
          </div>
          <h5 className="font-black text-neutral-900 uppercase tracking-tighter leading-tight">Knowledge Base</h5>
          <p className="text-xs text-neutral-500 font-bold">10,000+ Answers</p>
        </div>
        <div className="flex-1 space-y-4">
          <h3 className="text-2xl font-bold text-emerald-900 font-outfit">Can't find what you're looking for?</h3>
          <p className="text-emerald-700 font-medium">
            Our team of experts is available 24/7. Ask a specific question and get a response within 2 hours.
          </p>
          <div className="flex space-x-4">
            <button className="bg-emerald-900 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center space-x-2 hover:bg-black transition-colors">
              <MessageCircle size={18} />
              <span>Contact Expert</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
