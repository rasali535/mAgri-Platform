import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MessageSquare, ArrowRight, Zap, Globe, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Message = { role: 'user' | 'model'; text: string; timestamp: Date };

export default function ChatTab() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      text: 'Dumela! I am mARI, your AI Agronomist by Pameltex Tech. I can assist you in English, Setswana, Bemba, and Nyanja. How is your farm doing today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    "What is the best time to plant maize?",
    "How to treat Fall Armyworm naturally?",
    "Market price for soybeans in Lusaka?",
    "Weather forecast for the week"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const userMsg = textOverride || input.trim();
    if (!userMsg) return;

    if (!textOverride) setInput('');
    
    setMessages(prev => [...prev, { role: 'user', text: userMsg, timestamp: new Date() }]);
    setLoading(true);

    try {
      const newMessages = [
        ...messages.map(m => ({
          role: m.role === 'model' ? 'assistant' : 'user',
          content: m.text
        })),
        { role: 'user', content: userMsg }
      ];

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const text = data.content || 'I apologize, I could not process that request.';
      setMessages(prev => [...prev, { role: 'model', text, timestamp: new Date() }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Connection issue. Please check your network and try again.', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
     setMessages([{ role: 'model', text: 'Chat history cleared. How can I help you now?', timestamp: new Date() }]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-sm border border-neutral-100 overflow-hidden relative">
      <div className="bg-white px-6 py-4 border-b border-neutral-100 flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-600 p-2 rounded-2xl shadow-lg shadow-emerald-500/20">
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-neutral-900 leading-none mb-1">mARI — AI Specialist</h2>
            <div className="flex items-center text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">
              <Globe size={10} className="mr-1" /> Multi-lingual Support Active
            </div>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
          title="Clear Conversation"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-[#FBFBFC]">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-neutral-900' : 'bg-emerald-100'
              }`}>
                {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={16} className="text-emerald-700" />}
              </div>
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                <div className={`rounded-[1.5rem] px-5 py-3 text-sm font-medium leading-relaxed ${
                  msg.role === 'user'
                  ? 'bg-neutral-900 text-white rounded-tr-none shadow-lg shadow-neutral-900/10'
                  : 'bg-white border border-neutral-100 text-neutral-800 rounded-tl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-neutral-400 font-bold mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <Sparkles size={16} className="text-emerald-700 animate-pulse" />
            </div>
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-[1.5rem] rounded-tl-none px-5 py-3 shadow-sm flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-150" />
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-300" />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-white border-t border-neutral-100">
        <AnimatePresence>
          {messages.length < 3 && !loading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="flex flex-wrap gap-2 mb-6"
            >
              {suggestedPrompts.map((prompt) => (
                <button 
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="bg-neutral-50 hover:bg-emerald-50 hover:text-emerald-700 text-neutral-600 border border-neutral-100 hover:border-emerald-200 transition-all px-4 py-2 rounded-2xl text-xs font-bold flex items-center group"
                >
                  <MessageSquare size={12} className="mr-2 opacity-50 group-hover:opacity-100" />
                  {prompt}
                  <ArrowRight size={12} className="ml-2 opacity-0 group-hover:opacity-100 transform translate-x-[-4px] group-hover:translate-x-0 transition-all" />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative group flex items-center gap-3">
          <div className="flex-1 bg-neutral-100 border-2 border-transparent focus-within:border-emerald-500 focus-within:bg-white rounded-3xl p-1 transition-all duration-300 flex items-center pr-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask for expert agronomy advice..."
              className="flex-1 bg-transparent px-5 py-3 text-sm font-semibold focus:outline-none placeholder:text-neutral-400"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-2xl disabled:opacity-30 disabled:hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center active:scale-95"
            >
              <Send size={18} />
            </button>
          </div>
          <button className="hidden sm:flex bg-neutral-100 p-4 rounded-3xl text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
            <Zap size={20} />
          </button>
        </div>
        <p className="text-[10px] text-center text-neutral-400 font-bold mt-4 uppercase tracking-[0.2em] opacity-40">
          Powered by mARI Intelligence (Pameltex Tech) • Private & Secure
        </p>
      </div>
    </div>
  );
}

