'use client';

import { useEffect } from 'react';
import { useStore } from '@/stores/useStore';
import { isConfigured } from '@/lib/firebase';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const initAuth = useStore((s) => s.initAuth);

  useEffect(() => {
    if (!isConfigured) {
      console.warn('Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* environment variables.');
      // Mark auth as initialized so the app doesn't hang on loading spinner
      useStore.setState({ authInitialized: true });
      return;
    }
    const cleanup = initAuth();
    return cleanup;
  }, [initAuth]);

  return <>{children}</>;
}
