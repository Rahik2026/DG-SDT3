'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/stores/useStore';

export default function Home() {
  const { isAuthenticated, authInitialized } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!authInitialized) return; // Wait for Firebase to initialize
    router.push(isAuthenticated ? '/dashboard' : '/auth/login');
  }, [isAuthenticated, authInitialized, router]);

  return (
    <div className="min-h-screen bg-[#07070e] flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <span className="text-gray-400 text-sm">Loading CampusHub...</span>
      </div>
    </div>
  );
}
