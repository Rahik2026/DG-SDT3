'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, Search, Bell, Moon, Sun, X, Heart, MessageSquare,
  BookOpen, Megaphone, Calendar, CheckCheck,
} from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { toDate } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import React from 'react';

const notifIcons: Record<string, React.ReactNode> = {
  like: <Heart className="w-4 h-4 text-pink-400" />,
  comment: <MessageSquare className="w-4 h-4 text-blue-400" />,
  message: <MessageSquare className="w-4 h-4 text-indigo-400" />,
  homework: <BookOpen className="w-4 h-4 text-amber-400" />,
  exam: <Calendar className="w-4 h-4 text-red-400" />,
  announcement: <Megaphone className="w-4 h-4 text-emerald-400" />,
  file: <BookOpen className="w-4 h-4 text-purple-400" />,
};

export default function TopBar() {
  const { toggleSidebar, isDarkMode, toggleDarkMode, notifications, markNotificationRead, markAllNotificationsRead } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Issue #12: actually toggle light/dark on <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-6 bg-[#07070e]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="lg:hidden p-2 rounded-lg hover:bg-white/[0.06] text-gray-400 hover:text-white transition-colors"><Menu className="w-5 h-5" /></button>
        <div className="hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" placeholder="Search anything..."
              className="w-64 lg:w-80 pl-10 pr-12 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all" />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] text-gray-500 border border-white/[0.08]">⌘K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => setShowSearch(!showSearch)} className="md:hidden p-2 rounded-lg hover:bg-white/[0.06] text-gray-400 hover:text-white transition-colors"><Search className="w-5 h-5" /></button>

        {/* Issue #12: working theme toggle */}
        <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-white/[0.06] text-gray-400 hover:text-white transition-colors" title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="relative">
          <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-lg hover:bg-white/[0.06] text-gray-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-bold">{unreadCount}</span>}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-80 md:w-96 max-h-[70vh] overflow-hidden rounded-2xl border border-white/[0.08] bg-gray-900/95 backdrop-blur-xl shadow-2xl z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && <button onClick={markAllNotificationsRead} className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"><CheckCheck className="w-3.5 h-3.5" />Mark all read</button>}
                      <button onClick={() => setShowNotifications(false)} className="p-1 rounded-lg hover:bg-white/10 text-gray-500"><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-[60vh] divide-y divide-white/[0.04]">
                    {notifications.length === 0 && <p className="text-sm text-gray-500 text-center py-8">No notifications yet</p>}
                    {notifications.map((notif) => (
                      <div key={notif.id} onClick={() => markNotificationRead(notif.id)}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-white/[0.03] cursor-pointer transition-colors ${!notif.read ? 'bg-indigo-500/[0.03]' : ''}`}>
                        <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0 mt-0.5">{notifIcons[notif.type] || <Bell className="w-4 h-4 text-gray-400" />}</div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!notif.read ? 'text-white font-medium' : 'text-gray-300'}`}>{notif.body}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">{formatDistanceToNow(toDate(notif.createdAt), { addSuffix: true })}</p>
                        </div>
                        {!notif.read && <span className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showSearch && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="absolute inset-x-0 top-0 h-16 flex items-center px-4 bg-[#07070e]/95 backdrop-blur-xl md:hidden z-50">
            <Search className="w-4 h-4 text-gray-500 mr-3" />
            <input autoFocus type="text" placeholder="Search..." className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 focus:outline-none" />
            <button onClick={() => setShowSearch(false)} className="p-2 text-gray-400"><X className="w-5 h-5" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
