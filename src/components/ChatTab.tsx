import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MessageSquare, ArrowRight, Zap, Globe, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Message = { role: 'user' | 'model'; text: string; timestamp: Date };

export default function ChatTab() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      text: 'Dumela! I am mARI, your AI Agronomist by mAgri-Platform. I can assist you in English, Setswana, Bemba, and Nyanja. How is your farm doing today?',
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
      // Backend expects role:assistant instead of model
      const apiMessages = messages.map(m => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.text
      }));
      apiMessages.push({ role: 'user', content: userMsg });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const text = data.content || 'I apologize, I could not process that request.';
      setMessages(prev => [...prev, { role: 'model', text, timestamp: new Date() }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Connecting to mARI Agronomy Satellite... If this takes too long, please check your network connection.', timestamp: new Date() }]);
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
          {messages.map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${m.role === 'model' ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`flex items-start space-x-2 max-w-[85%] ${m.role === 'model' ? '' : 'flex-row-reverse space-x-reverse'}`}>
                <div className={`p-2 rounded-xl mt-1 shrink-0 ${m.role === 'model' ? 'bg-emerald-100 text-emerald-600' : 'bg-neutral-100 text-neutral-400'}`}>
                  {m.role === 'model' ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className={`p-4 rounded-2xl shadow-sm ${
                  m.role === 'model' 
                  ? 'bg-white text-neutral-800 border border-neutral-100' 
                  : 'bg-emerald-600 text-white font-medium'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  <p className={`text-[10px] mt-2 font-bold ${m.role === 'model' ? 'text-neutral-400' : 'text-emerald-100/70'}`}>
                    {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-neutral-100 px-4 py-3 rounded-2xl flex items-center space-x-3 shadow-sm">
                <div className="flex space-x-1">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">mARI is thinking</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-neutral-100">
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestedPrompts.map(p => (
              <button
                key={p}
                onClick={() => handleSend(p)}
                className="text-xs font-bold text-neutral-500 bg-neutral-50 border border-neutral-200 px-3 py-2 rounded-xl hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
              >
                {p}
              </button>
            ))}
          </div>
        )}
        <div className="relative flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your agricultural question here..."
            className="flex-1 bg-neutral-50 border border-neutral-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50 disabled:shadow-none transition-all"
          >
            <Send size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
