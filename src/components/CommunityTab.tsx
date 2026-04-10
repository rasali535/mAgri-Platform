import React from 'react';
import { MessageSquare, Users, TrendingUp, Award, Search, ArrowRight, Star } from 'lucide-react';
import { motion } from 'motion/react';

export default function CommunityTab() {
  const topics = [
    { title: "Sustainable Irrigation", posts: 124, members: "2.4k", icon: <TrendingUp size={20} />, color: "bg-emerald-100 text-emerald-700" },
    { title: "Organic Pest Control", posts: 89, members: "1.8k", icon: <Award size={20} />, color: "bg-indigo-100 text-indigo-700" },
    { title: "Grain Storage Tips", posts: 56, members: "900+", icon: <Star size={20} />, color: "bg-amber-100 text-amber-700" }
  ];

  const topContributors = [
    { name: "Dr. Mutale", expertise: "Soil Science", points: "2,540", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mutale" },
    { name: "Grace Banda", expertise: "Poultry Expert", points: "1,890", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Grace" },
    { name: "Chanda Mumba", expertise: "Maize Farming", points: "1,450", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chanda" }
  ];

  return (
    <div className="flex flex-col space-y-10 max-w-6xl mx-auto">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h2 className="text-4xl font-black text-neutral-900 font-outfit tracking-tighter uppercase">
          Farmer Community
        </h2>
        <p className="text-neutral-500 font-medium leading-relaxed">
          Join the conversation with over 5,000 farmers and experts. Share tips, ask questions, and grow together.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar: Topics */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-lg font-bold text-neutral-900 font-outfit uppercase tracking-tighter">Popular Topics</h3>
          <div className="space-y-3">
            {topics.map((topic, i) => (
              <div key={i} className="bg-white p-4 rounded-3xl border border-neutral-200 hover:border-emerald-500 transition-all cursor-pointer group">
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`p-2 rounded-xl ${topic.color}`}>
                    {topic.icon}
                  </div>
                  <span className="font-bold text-sm text-neutral-800">{topic.title}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase text-neutral-400">
                  <span>{topic.members} Members</span>
                  <span className="text-emerald-600 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-4 border-2 border-dashed border-neutral-300 rounded-3xl text-neutral-500 font-bold text-sm hover:border-emerald-500 hover:text-emerald-600 transition-all">
            + View All Topics
          </button>
        </div>

        {/* Main Feed: Discussions placeholder */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-emerald-50 rounded-[2.5rem] p-8 border border-emerald-100 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-emerald-900 font-outfit">Active Discussions</h3>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                <input 
                  type="text" 
                  placeholder="Search forum..." 
                  className="bg-white border-none rounded-full py-2 pl-10 pr-4 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 outline-none w-48 shadow-sm"
                />
              </div>
            </div>

            {[1, 2].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-neutral-100 hover:shadow-xl hover:shadow-emerald-900/5 transition-all space-y-4">
                <div className="flex items-center space-x-3">
                  <img src={topContributors[i].avatar} className="w-8 h-8 rounded-full bg-emerald-100" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-neutral-900">{topContributors[i].name} <span className="text-[10px] text-emerald-500 font-black ml-1 uppercase">Expert</span></p>
                    <p className="text-[10px] text-neutral-400 font-medium">Posted 2 hours ago</p>
                  </div>
                </div>
                <h4 className="font-bold text-neutral-800 leading-tight">
                  {i === 0 ? "What's the best time to apply top-dressing fertilizer for late-planted maize?" : "How are you handling the current locust swarm in the east?"}
                </h4>
                <p className="text-xs text-neutral-500 line-clamp-2">
                  {i === 0 ? "I've been seeing varying advice on local radio. Should I wait for the next heavy rain or apply it now while the soil is just damp?" : "My neighbor's farm was hit hard yesterday. We need to coordinate as a community to manage this effectively."}
                </p>
                <div className="flex items-center space-x-4 pt-4 border-t border-neutral-50">
                  <span className="flex items-center space-x-1 text-[10px] font-bold text-neutral-400">
                    <MessageSquare size={12} />
                    <span>{i === 0 ? "42 Comments" : "18 Comments"}</span>
                  </span>
                  <button className="ml-auto text-emerald-600 font-black text-[10px] uppercase tracking-widest flex items-center space-x-1 hover:underline">
                    <span>Read Discussion</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Contributors */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-lg font-bold text-neutral-900 font-outfit uppercase tracking-tighter">🏆 Top Helpers</h3>
          <div className="bg-white rounded-[2.5rem] p-6 border border-neutral-200 shadow-sm space-y-6">
            {topContributors.map((c, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="relative">
                  <img src={c.avatar} className="w-10 h-10 rounded-2xl bg-neutral-50 border border-neutral-200" />
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-400 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white">
                    {i + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-neutral-900 truncate">{c.name}</p>
                  <p className="text-[10px] text-neutral-400 font-medium truncate">{c.expertise}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-emerald-600 leading-none">{c.points}</p>
                  <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-tighter">Points</p>
                </div>
              </div>
            ))}
            <button className="w-full bg-neutral-900 text-white py-3 rounded-2xl text-xs font-bold hover:bg-neutral-800 transition-all flex items-center justify-center space-x-2">
              <Award size={14} />
              <span>Helper Leaderboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
