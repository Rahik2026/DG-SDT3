'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
  Send, Hash, Smile, TrendingUp, Flame, Sparkles, X, Trash2, Settings2,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useStore } from '@/stores/useStore';
import { toDate } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function FeedPage() {
  const { user, posts, addPost, toggleLike, removePost, isAdmin, hashtags, updateHashtags } = useStore();
  const [newPost, setNewPost] = useState('');
  const [showComposer, setShowComposer] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [showHashtagEditor, setShowHashtagEditor] = useState(false);
  const [editTags, setEditTags] = useState('');

  const handlePost = async () => {
    if (!newPost.trim()) return;
    const tags = newPost.match(/#\w+/g)?.map((t: string) => t.replace('#', '')) || [];
    await addPost(newPost, tags);
    setNewPost('');
    setShowComposer(false);
  };

  const toggleBookmark = (id: string) => setBookmarked((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const filteredPosts = selectedTag
    ? posts.filter((p) => p.tags?.some((t: string) => t.toLowerCase() === selectedTag.toLowerCase().replace('#', '')))
    : posts;

  const handleSaveHashtags = async () => {
    const tags = editTags.split(',').map((t: string) => t.trim()).filter(Boolean);
    if (tags.length > 0) await updateHashtags(tags);
    setShowHashtagEditor(false);
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Sparkles className="w-6 h-6 text-indigo-400" /> Community Feed</h1>
            <p className="text-sm text-gray-500 mt-1">Stay connected with your campus</p>
          </div>
          <Button variant="primary" icon={<Send className="w-4 h-4" />} onClick={() => setShowComposer(!showComposer)}>New Post</Button>
        </div>

        {/* Issue #8: Hashtags from Firestore + admin edit */}
        <Card padding="sm">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 flex-shrink-0">
              <Flame className="w-3.5 h-3.5" /><span className="text-xs font-semibold">Trending</span>
            </div>
            {hashtags.map((tag: string) => (
              <button key={tag} onClick={() => setSelectedTag(selectedTag === `#${tag}` ? null : `#${tag}`)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${selectedTag === `#${tag}` ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-white/[0.04] text-gray-400 border border-white/[0.06] hover:bg-white/[0.08]'}`}>
                #{tag}
              </button>
            ))}
            {selectedTag && <button onClick={() => setSelectedTag(null)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500"><X className="w-3.5 h-3.5" /></button>}
            {isAdmin && (
              <button onClick={() => { setEditTags(hashtags.join(', ')); setShowHashtagEditor(true); }}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-600 hover:text-indigo-400 flex-shrink-0 ml-auto">
                <Settings2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </Card>

        {/* Post Composer */}
        <AnimatePresence>
          {showComposer && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <Card glow>
                <div className="flex gap-3">
                  <Avatar name={user?.displayName || 'User'} size="md" />
                  <div className="flex-1">
                    <textarea autoFocus value={newPost} onChange={(e) => setNewPost(e.target.value)}
                      placeholder="What's on your mind? Use #hashtags to tag your post..."
                      className="w-full bg-transparent text-white placeholder-gray-500 text-sm resize-none outline-none min-h-[100px]" />
                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                      <div className="flex items-center gap-1">
                        <button className="p-2 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-indigo-400"><Hash className="w-5 h-5" /></button>
                        <button className="p-2 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-indigo-400"><Smile className="w-5 h-5" /></button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setShowComposer(false)}>Cancel</Button>
                        <Button size="sm" icon={<Send className="w-3.5 h-3.5" />} onClick={handlePost} disabled={!newPost.trim()}>Post</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Posts */}
        {filteredPosts.length === 0 && <Card><p className="text-sm text-gray-500 text-center py-8">No posts yet. Be the first to share something!</p></Card>}
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const isLiked = post.likes?.includes(user?.uid || '');
            const isSaved = bookmarked.has(post.id);
            return (
              <Card key={post.id} hover>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={post.authorName || 'User'} size="md" />
                    <div>
                      <span className="text-sm font-semibold text-white">{post.authorName}</span>
                      <p className="text-xs text-gray-500">{formatDistanceToNow(toDate(post.createdAt), { addSuffix: true })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Issue #8: admin can delete any post */}
                    {isAdmin && (
                      <button onClick={() => removePost(post.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-colors" title="Delete post">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500"><MoreHorizontal className="w-4 h-4" /></button>
                  </div>
                </div>

                <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap mb-3">{post.content}</p>

                {post.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {post.tags.map((tag: string) => (
                      <button key={tag} onClick={() => setSelectedTag(`#${tag}`)}
                        className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-[11px] font-medium hover:bg-indigo-500/20 transition-colors">#{tag}</button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 py-2 border-t border-white/[0.06] text-xs text-gray-500">
                  <span>{post.likes?.length || 0} likes</span>
                  <span>{post.commentCount || 0} comments</span>
                </div>

                <div className="flex items-center gap-1 pt-1 border-t border-white/[0.06]">
                  <button onClick={() => toggleLike(post.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${isLiked ? 'text-pink-400 bg-pink-500/[0.06]' : 'text-gray-500 hover:text-pink-400 hover:bg-pink-500/[0.04]'}`}>
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} /><span className="text-xs font-medium">Like</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-500/[0.04] transition-colors">
                    <MessageCircle className="w-4 h-4" /><span className="text-xs font-medium">Comment</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/[0.04] transition-colors">
                    <Share2 className="w-4 h-4" /><span className="text-xs font-medium">Share</span>
                  </button>
                  <button onClick={() => toggleBookmark(post.id)}
                    className={`p-2 rounded-lg transition-colors ${isSaved ? 'text-amber-400 bg-amber-500/[0.06]' : 'text-gray-500 hover:text-amber-400 hover:bg-amber-500/[0.04]'}`}>
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Issue #8: Hashtag editor modal for admin */}
        <Modal isOpen={showHashtagEditor} onClose={() => setShowHashtagEditor(false)} title="Edit Trending Hashtags" size="md">
          <div className="space-y-4">
            <p className="text-sm text-gray-400">Enter hashtags separated by commas:</p>
            <textarea value={editTags} onChange={(e) => setEditTags(e.target.value)} rows={3}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
              placeholder="General, Homework, Exams, Events, Help" />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowHashtagEditor(false)}>Cancel</Button>
              <Button onClick={handleSaveHashtags}>Save Hashtags</Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
