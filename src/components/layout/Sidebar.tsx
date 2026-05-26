'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, MessageSquare, FolderOpen, BookOpen, Shield,
  Newspaper, GraduationCap, ChevronLeft, ChevronRight, Sparkles,
  LogOut, Settings, CalendarDays,
} from 'lucide-react';
import { useStore } from '@/stores/useStore';
import Avatar from '@/components/ui/Avatar';

interface SidebarProps { isMobile: boolean; }

export default function Sidebar({ isMobile }: SidebarProps) {
  const pathname = usePathname();
  const { user, sidebarOpen, toggleSidebar, logout, isAdmin } = useStore();

  // Issue #7: removed "Campus Community" from dashboard area
  // Issue #11: added dedicated Exams menu below Community
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'from-indigo-500 to-blue-500' },
    { href: '/feed', label: 'Community', icon: Newspaper, color: 'from-emerald-500 to-teal-500' },
    { href: '/exams', label: 'Exams', icon: CalendarDays, color: 'from-red-500 to-orange-500' },
    { href: '/chat', label: 'Messages', icon: MessageSquare, color: 'from-violet-500 to-purple-500' },
    { href: '/files', label: 'Files', icon: FolderOpen, color: 'from-amber-500 to-orange-500' },
    { href: '/questions', label: 'Question Bank', icon: BookOpen, color: 'from-pink-500 to-rose-500' },
    // Issue #4: only show Admin to admin users
    ...(isAdmin ? [{ href: '/admin', label: 'Admin', icon: Shield, color: 'from-cyan-500 to-blue-500' }] : []),
  ];

  const sidebarWidth = sidebarOpen ? 260 : 72;

  return (
    <>
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40" onClick={toggleSidebar} />
        )}
      </AnimatePresence>

      <aside className="fixed top-0 left-0 h-screen z-50 flex flex-col bg-[#0a0a12] dark:bg-[#0a0a12] border-r border-white/[0.06] dark:border-white/[0.06] transition-all duration-300 ease-in-out overflow-hidden"
        style={{ width: isMobile ? 260 : sidebarWidth, transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)' }}>

        <div className="flex items-center h-16 px-4 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            {(sidebarOpen || isMobile) && (
              <div className="flex flex-col whitespace-nowrap">
                <span className="text-sm font-bold text-white tracking-tight">CampusHub</span>
                <span className="text-[10px] text-gray-500 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> College Community</span>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const showLabel = sidebarOpen || isMobile;
            return (
              <Link key={item.href} href={item.href} onClick={() => isMobile && sidebarOpen && toggleSidebar()}>
                <div className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 group ${isActive ? 'bg-white/[0.08] text-white' : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'}`}>
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-indigo-400 to-purple-500" />}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${isActive ? `bg-gradient-to-br ${item.color} shadow-lg` : 'bg-white/[0.05] group-hover:bg-white/[0.08]'}`}>
                    <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-white' : ''}`} />
                  </div>
                  {showLabel && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
                  {item.label === 'Messages' && showLabel && (
                    <span className="ml-auto px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-semibold">3</span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {!isMobile && (
          <div className="flex justify-center py-2 border-t border-white/[0.06]">
            <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-gray-300 transition-colors">
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        )}

        <div className="border-t border-white/[0.06] p-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Avatar name={user?.displayName || 'User'} size="md" isOnline={true} />
            {(sidebarOpen || isMobile) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.displayName}</p>
                <p className="text-[11px] text-gray-500 truncate">{user?.department} · {user?.year}</p>
              </div>
            )}
            {(sidebarOpen || isMobile) && (
              <button onClick={logout} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
