'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Users, FileText, MessageSquare, BarChart3,
  TrendingUp, Ban, Eye, MoreHorizontal, Search, Filter,
  Activity, Plus, Trash2, Edit, Megaphone, AlertCircle,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Modal from '@/components/ui/Modal';
import { useStore } from '@/stores/useStore';
import { toDate } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
];

export default function AdminPage() {
  const { users, posts, files, chatRooms, announcements, isAdmin,
    addAnnouncement, editAnnouncement, removeAnnouncement } = useStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddAnn, setShowAddAnn] = useState(false);
  const [annForm, setAnnForm] = useState({ title: '', content: '', priority: 'medium' });
  const [annError, setAnnError] = useState('');

  // Issue #4: redirect non-admins
  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Shield className="w-16 h-16 text-gray-700 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Admin Access Required</h2>
          <p className="text-sm text-gray-500">You don&apos;t have permission to access this page.</p>
        </div>
      </AppLayout>
    );
  }

  const handleAddAnnouncement = async () => {
    setAnnError('');
    if (!annForm.title.trim() || !annForm.content.trim()) { setAnnError('Title and content are required.'); return; }
    await addAnnouncement(annForm.title, annForm.content, annForm.priority);
    setAnnForm({ title: '', content: '', priority: 'medium' });
    setShowAddAnn(false);
  };

  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-6">
        <motion.div variants={item} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Shield className="w-6 h-6 text-indigo-400" /> Admin Panel</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your campus platform</p>
          </div>
          <Badge variant="success" dot>Admin Mode</Badge>
        </motion.div>

        <motion.div variants={item} className="flex items-center gap-1 border-b border-white/[0.06] pb-px">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${activeTab === tab.id ? 'text-indigo-400 border-indigo-400' : 'text-gray-500 border-transparent hover:text-gray-300'}`}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </motion.div>

        {activeTab === 'overview' && (
          <>
            <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: users.length, icon: Users, color: 'from-indigo-500 to-blue-500' },
                { label: 'Total Posts', value: posts.length, icon: MessageSquare, color: 'from-emerald-500 to-teal-500' },
                { label: 'Files', value: files.length, icon: FileText, color: 'from-purple-500 to-pink-500' },
                { label: 'Active Chats', value: chatRooms.length, icon: Activity, color: 'from-amber-500 to-orange-500' },
              ].map((stat) => (
                <Card key={stat.label} hover glow>
                  <div className="flex items-start justify-between">
                    <div><p className="text-xs text-gray-500 font-medium">{stat.label}</p><p className="text-2xl font-bold text-white mt-1">{stat.value}</p></div>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}><stat.icon className="w-5 h-5 text-white" /></div>
                  </div>
                </Card>
              ))}
            </motion.div>

            <motion.div variants={item}>
              <Card>
                <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4"><Activity className="w-4 h-4 text-purple-400" /> Recent Users</h3>
                <div className="space-y-2">
                  {users.slice(0, 8).map((u) => (
                    <div key={u.uid} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                      <Avatar name={u.displayName || 'User'} size="md" isOnline={u.isOnline} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{u.displayName}</span>
                          <Badge variant={u.role === 'admin' ? 'danger' : 'default'} size="sm">{u.role}</Badge>
                        </div>
                        <p className="text-xs text-gray-500">{u.email} · {u.department} · {u.year}</p>
                      </div>
                      <Badge variant={u.isOnline ? 'success' : 'default'} size="sm" dot>{u.isOnline ? 'Online' : 'Offline'}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </>
        )}

        {activeTab === 'users' && (
          <motion.div variants={item}>
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white">All Users ({users.length})</h3>
              </div>
              <div className="space-y-2">
                {users.map((u) => (
                  <div key={u.uid} className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.04] hover:bg-white/[0.02]">
                    <Avatar name={u.displayName || 'User'} size="md" isOnline={u.isOnline} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-white">{u.displayName}</span>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                    <Badge variant={u.role === 'admin' ? 'danger' : 'default'} size="sm">{u.role}</Badge>
                    <span className="text-xs text-gray-500">{u.department} · {u.year}</span>
                    <Badge variant={u.isOnline ? 'success' : 'default'} size="sm" dot>{u.isOnline ? 'Online' : 'Offline'}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Issue #5: Admin can create/edit/delete announcements */}
        {activeTab === 'announcements' && (
          <motion.div variants={item} className="space-y-4">
            <div className="flex justify-end">
              <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddAnn(true)}>New Announcement</Button>
            </div>
            {announcements.length === 0 && <Card><p className="text-sm text-gray-500 text-center py-8">No announcements yet. Create one above.</p></Card>}
            {announcements.map((ann) => (
              <Card key={ann.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-base font-semibold text-white">{ann.title}</h4>
                      <Badge variant={ann.priority === 'high' ? 'danger' : ann.priority === 'medium' ? 'warning' : 'default'} size="sm">{ann.priority}</Badge>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{ann.content}</p>
                    <p className="text-xs text-gray-600 mt-2">By {ann.authorName} · {formatDistanceToNow(toDate(ann.createdAt), { addSuffix: true })}</p>
                  </div>
                  <button onClick={() => removeAnnouncement(ann.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </Card>
            ))}

            <Modal isOpen={showAddAnn} onClose={() => setShowAddAnn(false)} title="New Announcement" size="lg">
              <div className="space-y-4">
                {annError && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-sm text-red-400"><AlertCircle className="w-4 h-4" />{annError}</div>}
                <div><label className="text-sm text-gray-300 mb-1 block">Title *</label><input value={annForm.title} onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40" placeholder="Announcement title" /></div>
                <div><label className="text-sm text-gray-300 mb-1 block">Content *</label><textarea value={annForm.content} onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })} rows={4} className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none" placeholder="Write your announcement..." /></div>
                <div><label className="text-sm text-gray-300 mb-1 block">Priority</label><select value={annForm.priority} onChange={(e) => setAnnForm({ ...annForm, priority: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none appearance-none"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
                <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setShowAddAnn(false)}>Cancel</Button><Button onClick={handleAddAnnouncement} icon={<Plus className="w-4 h-4" />}>Publish</Button></div>
              </div>
            </Modal>
          </motion.div>
        )}
      </motion.div>
    </AppLayout>
  );
}
