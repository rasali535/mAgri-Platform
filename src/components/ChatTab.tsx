import { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type Message = { role: 'user' | 'model'; text: string };

export default function ChatTab() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Dumela! How can I help you with your farm today? I can speak Setswana, Bemba, Nyanja, and English.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: 'You are an agricultural assistant for farmers in Sub-Saharan Africa (Côte d\'Ivoire, Zambia, Botswana). You understand and can respond in Setswana, Bemba, Nyanja, and English. Keep answers concise, practical, and tailored to local farming realities (e.g., staple crops like maize, cocoa, cashew).',
        }
      });

      const response = await chat.sendMessage({ message: userMsg });
      
      setMessages(prev => [...prev, { role: 'model', text: response.text || 'Sorry, I could not process that.' }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Network error. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-emerald-50 p-3 border-b border-emerald-100 flex items-center space-x-3">
        <div className="bg-emerald-600 p-2 rounded-full">
          <Bot size={20} className="text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-emerald-900 text-sm">AgriBot Assistant</h2>
          <p className="text-[10px] text-emerald-700">Linguistic AI (Setswana, Bemba, Nyanja)</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
              msg.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-tr-sm' 
                : 'bg-white border border-stone-200 text-stone-800 rounded-tl-sm shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-sm p-3 shadow-sm flex space-x-2">
              <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white border-t border-stone-200">
        <div className="flex items-center bg-stone-100 rounded-full p-1 pr-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about crops, weather, pests..."
            className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-emerald-600 text-white p-2 rounded-full disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
