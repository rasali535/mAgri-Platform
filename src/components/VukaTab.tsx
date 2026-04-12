import React, { useState, useEffect, useRef } from 'react';
import {
  Users, UserPlus, MessageCircle, Share2, Heart, Send,
  Search, Loader2, X, CheckCircle, Plus, RefreshCw,
  Smartphone, Globe, ChevronDown, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ─── Types ──────────────────────────────────────────────────────────────────
interface Post {
  id: string;
  user: string;
  avatar: string;
  content: string;
  likes: number;
  comments: number;
  time: string;
  liked?: boolean;
}

interface Friend {
  name: string;
  msisdn: string;
  status: 'Online' | 'Away' | 'Offline';
  avatar: string;
}

interface Group {
  id: string;
  name: string;
  members: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const API = (path: string, opts?: RequestInit) =>
  fetch(`/api${path}`, { headers: { 'Content-Type': 'application/json' }, ...opts });

const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

const DEMO_POSTS: Post[] = [
  {
    id: '1', user: 'Chanda Mumba',
    avatar: avatar('Chanda'),
    content: 'Found a great way to handle the maize drought in my area. Using mulching + morning watering is showing amazing results! 🌽 #Farming #Zambia',
    likes: 24, comments: 5, time: '2h ago', liked: false
  },
  {
    id: '2', user: 'Kofi Mensah',
    avatar: avatar('Kofi'),
    content: 'Anyone interested in a buying group for fertilizers? We can get a 15% discount if we order together. Reply below or DM me! 🤝',
    likes: 12, comments: 18, time: '5h ago', liked: false
  },
  {
    id: '3', user: 'Grace Mwale',
    avatar: avatar('Grace'),
    content: 'Just harvested 15 bags of groundnuts from 1 acre using mARI Platform by Pameltex Tech recommendations. The AI advice really works! 🎉',
    likes: 47, comments: 9, time: '1d ago', liked: false
  }
];

const DEMO_FRIENDS: Friend[] = [
  { name: 'Sarah Phiri', msisdn: '+260971234567', status: 'Online', avatar: avatar('Sarah') },
  { name: 'John Daka', msisdn: '+260972345678', status: 'Away', avatar: avatar('John') },
  { name: 'Mercy Zulu', msisdn: '+260973456789', status: 'Offline', avatar: avatar('Mercy') },
];

const DEMO_GROUPS: Group[] = [
  { id: 'g1', name: 'Zambia Maize Farmers', members: 142 },
  { id: 'g2', name: 'Lusaka Poultry Network', members: 89 },
  { id: 'g3', name: 'Vuka General HQ', members: 312 },
];

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold ${
        type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'
      }`}
    >
      {type === 'success' ? <CheckCircle size={16} /> : <X size={16} />}
      {msg}
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VukaTab({ phone, name }: { phone?: string; name?: string }) {
  const [activeView, setActiveView] = useState<'feed' | 'friends' | 'groups'>('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<Friend[]>(DEMO_FRIENDS);
  const [groups, setGroups] = useState<Group[]>(DEMO_GROUPS);

  // Fetch real data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Posts
        const postsRes = await API('/vuka/posts');
        const postsData = await postsRes.json();
        if (postsData.posts) {
          const mapped: Post[] = postsData.posts.map((p: any) => ({
            id: p.id || p.created_at,
            user: p.author?.name || p.author_msisdn || 'Farmer',
            avatar: avatar(p.author_msisdn || 'Farmer'),
            content: p.content,
            likes: 0,
            comments: 0,
            time: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Recently'
          }));
          setPosts(mapped);
        }

        // 2. Friends (if phone available)
        if (phone) {
          const friendsRes = await API(`/vuka/friends?msisdn=${phone}`);
          const friendsData = await friendsRes.json();
          if (friendsData.friends?.length > 0) {
            const mappedFriends: Friend[] = friendsData.friends.map((f: any) => ({
              name: f.name || 'Farmer',
              msisdn: f.friend_msisdn || f.msisdn,
              status: 'Online',
              avatar: avatar(f.friend_msisdn || f.msisdn)
            }));
            setFriends(mappedFriends);
          }
        }

        // 3. Groups (if phone available)
        if (phone) {
          const groupsRes = await API(`/vuka/groups?msisdn=${phone}`);
          const groupsData = await groupsRes.json();
          if (groupsData.groups?.length > 0) {
            setGroups(groupsData.groups);
          }
        }

      } catch (err) {
        console.error('Failed to fetch Vuka data:', err);
        setPosts(DEMO_POSTS); // Fallback to demo data on error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [phone]);

  // Post form
  const [postText, setPostText] = useState('');
  const [postLoading, setPostLoading] = useState(false);

  // Comments
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  // Friend search
  const [friendQuery, setFriendQuery] = useState('');
  const [addingFriend, setAddingFriend] = useState<string | null>(null);

  // Group creation
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [joiningGroup, setJoiningGroup] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => setToast({ msg, type });

  // Relay
  const [relayTarget, setRelayTarget] = useState('');
  const [relayMsg, setRelayMsg] = useState('');
  const [relaying, setRelaying] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handlePost = async () => {
    if (!postText.trim()) return;
    setPostLoading(true);
    
    // Real API call
    try {
      const res = await API('/vuka/posts', { 
        method: 'POST', 
        body: JSON.stringify({ 
          content: postText.trim(),
          msisdn: phone 
        }) 
      });
      
      if (res.ok) {
        // Optimistic UI update or re-fetch
        const newPost: Post = {
          id: Date.now().toString(),
          user: name || 'You',
          avatar: avatar(phone || 'Me'),
          content: postText.trim(),
          likes: 0, comments: 0,
          time: 'Just now', liked: false
        };
        setPosts(prev => [newPost, ...prev]);
        setPostText('');
        showToast('Post shared with the Vuka community!');
      } else {
        showToast('Failed to share post.', 'error');
      }
    } catch (err) {
      showToast('Network error while posting.', 'error');
    }
    setPostLoading(false);
  };

  const handleLike = (id: string) => {
    setPosts(prev => prev.map(p =>
      p.id === id
        ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked }
        : p
    ));
  };

  const handleComment = (postId: string) => {
    if (!commentText.trim()) return;
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, comments: p.comments + 1 } : p
    ));
    setCommentText('');
    setOpenComments(null);
    showToast('Comment added!');
  };

  const handleAddFriend = async (friend: Friend) => {
    setAddingFriend(friend.msisdn);
    try {
      await API('/vuka/friends', {
        method: 'POST',
        body: JSON.stringify({ 
          msisdn: phone, // User's phone
          friendMsisdn: friend.msisdn 
        })
      });
      showToast(`Friend request sent to ${friend.name}!`);
    } catch {
      showToast('Could not add friend. Try again.', 'error');
    } finally {
      setAddingFriend(null);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;
    try {
      const res = await API('/vuka/groups', {
        method: 'POST',
        body: JSON.stringify({ 
          name: groupName.trim(),
          ownerMsisdn: phone || 'web-user'
        })
      });
      const data = await res.json().catch(() => null);
      const newGroup: Group = {
        id: data?.id || Date.now().toString(),
        name: groupName.trim(),
        members: 1
      };
      setGroups(prev => [newGroup, ...prev]);
      setGroupName('');
      setShowGroupForm(false);
      showToast(`Group "${newGroup.name}" created!`);
    } catch {
      showToast('Could not create group. Try again.', 'error');
    }
  };

  const handleJoinGroup = async (group: Group) => {
    setJoiningGroup(group.id);
    try {
      await API('/vuka/groups/join', {
        method: 'POST',
        body: JSON.stringify({ 
          groupId: group.id,
          msisdn: phone
        })
      });
      setGroups(prev => prev.map(g =>
        g.id === group.id ? { ...g, members: g.members + 1 } : g
      ));
      showToast(`Joined "${group.name}"!`);
    } catch {
      showToast('Could not join group. Try again.', 'error');
    } finally {
      setJoiningGroup(null);
    }
  };

  const handleRelay = async () => {
    if (!relayTarget.trim() || !relayMsg.trim()) return;
    setRelaying(true);
    try {
      const res = await API('/vuka/relay', {
        method: 'POST',
        body: JSON.stringify({ 
          senderMsisdn: phone,
          recipientMsisdn: relayTarget, 
          message: relayMsg 
        })
      });
      if (!res.ok) throw new Error();
      setRelayTarget('');
      setRelayMsg('');
      showToast('Message sent via WhatsApp!');
    } catch {
      showToast('WhatsApp relay failed. Is the bot connected?', 'error');
    } finally {
      setRelaying(false);
    }
  };

  const filteredFriends = friends.filter(f =>
    f.name.toLowerCase().includes(friendQuery.toLowerCase()) ||
    f.msisdn.includes(friendQuery)
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col space-y-6">

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900 font-outfit tracking-tight">Vuka Social</h2>
          <p className="text-neutral-500">Connect with fellow farmers across the mARI network</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-neutral-200 self-start">
          {(['feed', 'friends', 'groups'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all capitalize ${
                activeView === view
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                  : 'text-neutral-500 hover:bg-neutral-50'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* ── FEED VIEW ── */}
      <AnimatePresence mode="wait">
        {activeView === 'feed' && (
          <motion.div
            key="feed"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Main feed */}
            <div className="lg:col-span-2 space-y-6">
              {/* Post composer */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200">
                <div className="flex space-x-4">
                  <img src={avatar('Me')} alt="You" className="w-11 h-11 rounded-2xl border border-emerald-100" />
                  <div className="flex-1">
                    <textarea
                      ref={textareaRef}
                      value={postText}
                      onChange={e => setPostText(e.target.value)}
                      placeholder="What's happening on your farm today?"
                      className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition-all outline-none resize-none"
                      rows={3}
                      onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handlePost(); }}
                    />
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-neutral-400">{postText.length}/500 · Cmd+Enter to post</p>
                      <button
                        onClick={handlePost}
                        disabled={!postText.trim() || postLoading || postText.length > 500}
                        className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {postLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Posts */}
              <AnimatePresence>
                {posts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img src={post.avatar} alt={post.user} className="w-10 h-10 rounded-xl border border-neutral-100" />
                        <div>
                          <h4 className="font-bold text-neutral-900 text-sm leading-none">{post.user}</h4>
                          <p className="text-[10px] text-neutral-400 font-medium mt-0.5">{post.time}</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-neutral-700 leading-relaxed">{post.content}</p>

                    <div className="flex items-center gap-4 pt-2 border-t border-neutral-50">
                      {/* Like */}
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1.5 text-xs font-bold transition-all px-3 py-1.5 rounded-xl ${
                          post.liked
                            ? 'text-red-500 bg-red-50'
                            : 'text-neutral-500 hover:text-red-500 hover:bg-red-50'
                        }`}
                      >
                        <Heart size={14} className={post.liked ? 'fill-red-500' : ''} />
                        {post.likes}
                      </button>

                      {/* Comment toggle */}
                      <button
                        onClick={() => setOpenComments(openComments === post.id ? null : post.id)}
                        className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-xl transition-all"
                      >
                        <MessageCircle size={14} />
                        {post.comments}
                      </button>

                      {/* WhatsApp relay */}
                      <button
                        onClick={() => { setRelayMsg(post.content); setActiveView('feed'); }}
                        className="ml-auto flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-xl transition-all"
                      >
                        <Share2 size={14} />
                        Relay
                      </button>
                    </div>

                    {/* Comment box */}
                    <AnimatePresence>
                      {openComments === post.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex gap-3 pt-2">
                            <input
                              value={commentText}
                              onChange={e => setCommentText(e.target.value)}
                              placeholder="Add a comment…"
                              className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                              onKeyDown={e => { if (e.key === 'Enter') handleComment(post.id); }}
                            />
                            <button
                              onClick={() => handleComment(post.id)}
                              disabled={!commentText.trim()}
                              className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
                            >
                              <Send size={14} />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Suggested Friends */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200">
                <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
                  <UserPlus size={18} className="text-emerald-500" />
                  Suggested Farmers
                </h3>
                <div className="space-y-4">
                  {DEMO_FRIENDS.map(friend => (
                    <div key={friend.msisdn} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <img src={friend.avatar} alt="" className="w-9 h-9 rounded-xl" />
                        <div>
                          <p className="text-sm font-bold text-neutral-800 leading-none">{friend.name}</p>
                          <p className={`text-[10px] font-medium mt-0.5 ${
                            friend.status === 'Online' ? 'text-emerald-500' : 'text-neutral-400'
                          }`}>{friend.status}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddFriend(friend)}
                        disabled={addingFriend === friend.msisdn}
                        className="p-2 bg-neutral-50 text-neutral-400 rounded-xl group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all disabled:opacity-50"
                      >
                        {addingFriend === friend.msisdn
                          ? <Loader2 size={16} className="animate-spin" />
                          : <UserPlus size={16} />
                        }
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* WhatsApp Relay */}
              <div className="bg-neutral-900 rounded-3xl p-6 text-white shadow-xl">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Smartphone size={16} className="text-emerald-400" />
                  WhatsApp Relay
                </h3>
                <div className="space-y-3">
                  <input
                    value={relayTarget}
                    onChange={e => setRelayTarget(e.target.value)}
                    placeholder="+260971234567"
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                  />
                  <textarea
                    value={relayMsg}
                    onChange={e => setRelayMsg(e.target.value)}
                    placeholder="Type message to relay…"
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 resize-none"
                    rows={2}
                  />
                  <button
                    onClick={handleRelay}
                    disabled={!relayTarget.trim() || !relayMsg.trim() || relaying}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2.5 rounded-xl text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {relaying ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Send via WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── FRIENDS VIEW ── */}
        {activeView === 'friends' && (
          <motion.div
            key="friends"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Search */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    value={friendQuery}
                    onChange={e => setFriendQuery(e.target.value)}
                    placeholder="Search by name or phone number…"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Friends list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFriends.map(friend => (
                <motion.div
                  key={friend.msisdn}
                  initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200 flex flex-col items-center gap-4"
                >
                  <img src={friend.avatar} alt={friend.name} className="w-16 h-16 rounded-2xl border-2 border-emerald-100" />
                  <div className="text-center">
                    <h4 className="font-bold text-neutral-900">{friend.name}</h4>
                    <p className="text-xs text-neutral-500 font-mono mt-0.5">{friend.msisdn}</p>
                    <span className={`inline-flex items-center gap-1 mt-2 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      friend.status === 'Online' ? 'bg-emerald-100 text-emerald-700' :
                      friend.status === 'Away' ? 'bg-amber-100 text-amber-700' :
                      'bg-neutral-100 text-neutral-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        friend.status === 'Online' ? 'bg-emerald-500' :
                        friend.status === 'Away' ? 'bg-amber-500' : 'bg-neutral-400'
                      }`} />
                      {friend.status}
                    </span>
                  </div>
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => handleAddFriend(friend)}
                      disabled={addingFriend === friend.msisdn}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {addingFriend === friend.msisdn
                        ? <Loader2 size={13} className="animate-spin" />
                        : <UserPlus size={13} />}
                      Add
                    </button>
                    <button
                      onClick={() => { setRelayTarget(friend.msisdn); setActiveView('feed'); }}
                      className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare size={13} />
                      Message
                    </button>
                  </div>
                </motion.div>
              ))}
              {filteredFriends.length === 0 && (
                <div className="col-span-3 py-12 text-center text-neutral-400">
                  <Users size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="font-semibold">No farmers found</p>
                  <p className="text-sm mt-1">Try a different name or number</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── GROUPS VIEW ── */}
        {activeView === 'groups' && (
          <motion.div
            key="groups"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Create group */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-neutral-900">Farmer Groups</h3>
                <button
                  onClick={() => setShowGroupForm(!showGroupForm)}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
                >
                  <Plus size={16} />
                  New Group
                </button>
              </div>

              <AnimatePresence>
                {showGroupForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="flex gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <input
                        value={groupName}
                        onChange={e => setGroupName(e.target.value)}
                        placeholder="Group name (e.g. Northern Tobacco Farmers)"
                        className="flex-1 bg-white border border-emerald-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        onKeyDown={e => { if (e.key === 'Enter') handleCreateGroup(); }}
                      />
                      <button
                        onClick={handleCreateGroup}
                        disabled={!groupName.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                      >
                        Create
                      </button>
                      <button
                        onClick={() => { setShowGroupForm(false); setGroupName(''); }}
                        className="bg-neutral-200 text-neutral-600 px-3 py-2.5 rounded-xl text-sm font-bold hover:bg-neutral-300 transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map((group, i) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0">
                        {group.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 text-sm leading-tight">{group.name}</h4>
                        <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
                          <Users size={10} className="inline mr-1" />{group.members} members
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleJoinGroup(group)}
                      disabled={joiningGroup === group.id}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {joiningGroup === group.id
                        ? <Loader2 size={13} className="animate-spin" />
                        : <Plus size={13} />}
                      Join Group
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
