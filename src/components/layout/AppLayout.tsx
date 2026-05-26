'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useStore } from '@/stores/useStore';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, sidebarOpen, authInitialized } = useStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth < 1024);
  }, []);

  useEffect(() => {
    setMounted(true);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  useEffect(() => {
    if (mounted && authInitialized && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authInitialized, router, mounted]);

  if (!mounted || !authInitialized) {
    return (
      <div className="min-h-screen bg-[#07070e] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <span className="text-gray-400 text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const mainMarginLeft = isMobile ? 0 : sidebarOpen ? 260 : 72;

  return (
    <div className="min-h-screen bg-[#07070e] text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/[0.03] rounded-full blur-[120px]" />
      </div>

      <Sidebar isMobile={isMobile} />

      <main
        className="relative min-h-screen flex flex-col transition-[margin-left] duration-300 ease-in-out"
        style={{ marginLeft: mainMarginLeft }}
      >
        <TopBar />
        <div className="flex-1 p-4 md:p-6 animate-fadeIn">
          {children}
        </div>
      </main>
    </div>
  );
}
