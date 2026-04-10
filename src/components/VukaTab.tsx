import React, { useState, useEffect } from 'react';
import { Users, UserPlus, MessageCircle, Share2, Heart, MessageSquare, Send, Search, Filter } from 'lucide-react';
import { motion } from 'motion/react';

export default function VukaTab() {
  const [activeView, setActiveView] = useState<'feed' | 'friends' | 'groups'>('feed');
  
  const posts = [
    {
      id: 1,
      user: "Chanda Mumba",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chanda",
      content: "Found a great way to handle the maize drought in my area. Sharing the tips soon! #Farming #Zambia",
      likes: 24,
      comments: 5,
      time: "2h ago"
    },
    {
      id: 2,
      user: "Kofi Mensah",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kofi",
      content: "Anyone interested in a buying group for fertilizers? We can get a 15% discount if we order together. DM me!",
      likes: 12,
      comments: 18,
      time: "5h ago"
    }
  ];

  const friends = [
    { name: "Sarah Phiri", status: "Online", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
    { name: "John Daka", status: "Away", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John" },
    { name: "Mercy Zulu", status: "Offline", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mercy" }
  ];

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900 font-outfit tracking-tight">Vuka Social</h2>
          <p className="text-neutral-500">Connect with fellow farmers across the network</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-neutral-200">
          {(['feed', 'friends', 'groups'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                activeView === view 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' 
                : 'text-neutral-500 hover:bg-neutral-50'
              }`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Box */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200">
            <div className="flex space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold overflow-hidden border-2 border-emerald-50">
                <Users size={24} />
              </div>
              <div className="flex-1">
                <textarea 
                  placeholder="What's happening on your farm?"
                  className="w-full bg-neutral-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none resize-none"
                  rows={3}
                ></textarea>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex space-x-2">
                    <button className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-xl transition-colors">
                      <Share2 size={18} />
                    </button>
                    <button className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-xl transition-colors">
                      <Users size={18} />
                    </button>
                  </div>
                  <button className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-emerald-200 transition-all flex items-center space-x-2">
                    <span>Post Message</span>
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Posts */}
          {posts.map(post => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src={post.avatar} alt={post.user} className="w-10 h-10 rounded-xl border border-neutral-100" />
                  <div>
                    <h4 className="font-bold text-neutral-900 text-sm">{post.user}</h4>
                    <p className="text-[10px] text-neutral-500 font-medium">{post.time}</p>
                  </div>
                </div>
                <button className="text-neutral-400 hover:text-neutral-600">
                  <Heart size={20} />
                </button>
              </div>
              <p className="text-sm text-neutral-700 leading-relaxed font-outfit">
                {post.content}
              </p>
              <div className="flex items-center space-x-6 pt-2 border-t border-neutral-50">
                <div className="flex items-center space-x-2 text-neutral-500">
                  <Heart size={16} className={post.likes > 20 ? "text-red-500 fill-red-500" : ""} />
                  <span className="text-xs font-bold">{post.likes}</span>
                </div>
                <div className="flex items-center space-x-2 text-neutral-500">
                  <MessageCircle size={16} />
                  <span className="text-xs font-bold">{post.comments}</span>
                </div>
                <div className="ml-auto text-emerald-600 text-xs font-bold hover:underline cursor-pointer">
                  WhatsApp Relay
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Find Friends */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200">
            <h3 className="font-bold text-neutral-900 mb-4 flex items-center space-x-2">
              <UserPlus size={18} className="text-emerald-500" />
              <span>Suggested Friends</span>
            </h3>
            <div className="space-y-4">
              {friends.map(friend => (
                <div key={friend.name} className="flex items-center justify-between group">
                  <div className="flex items-center space-x-3">
                    <img src={friend.avatar} alt="" className="w-8 h-8 rounded-lg" />
                    <div>
                      <p className="text-sm font-bold text-neutral-800 leading-none">{friend.name}</p>
                      <p className={`text-[10px] font-medium ${friend.status === 'Online' ? 'text-emerald-500' : 'text-neutral-400'}`}>
                        {friend.status}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 bg-neutral-50 text-neutral-400 rounded-xl group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                    <UserPlus size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Active Groups */}
          <div className="bg-emerald-900 rounded-3xl p-6 text-white shadow-xl shadow-emerald-950/20 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl"></div>
            <h3 className="font-bold mb-4 relative z-10">Trending Groups</h3>
            <div className="space-y-3 relative z-10">
              {['Zambia Maize Farmers', 'Lushaka Poultry', 'Vuka General HQ'].map(group => (
                <div key={group} className="flex items-center space-x-3 p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all cursor-pointer">
                  <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-xs">
                    {group.charAt(0)}
                  </div>
                  <span className="text-xs font-bold truncate">{group}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
