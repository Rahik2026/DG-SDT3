'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight,
  Sparkles, BookOpen, MessageSquare, Users, Zap, AlertCircle,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useStore } from '@/stores/useStore';

const features = [
  { icon: MessageSquare, label: 'Real-time Chat', desc: 'WhatsApp-style messaging' },
  { icon: Users, label: 'Community Feed', desc: 'Share & connect with peers' },
  { icon: BookOpen, label: 'Question Bank', desc: 'Past papers & resources' },
  { icon: Zap, label: 'Smart Dashboard', desc: 'Track everything in one place' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading, isAuthenticated, authInitialized, authError } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (authInitialized && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authInitialized, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    }
  };

  // Show spinner while Firebase auth is initializing
  if (!authInitialized) {
    return (
      <div className="min-h-screen bg-[#07070e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-gray-500 text-sm">Connecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070e] flex">
      {/* Left: Feature showcase */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="relative flex flex-col justify-center px-12 xl:px-20 z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">CampusHub</h1>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Your College, Connected
                </p>
              </div>
            </div>

            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              The all-in-one<br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                college platform
              </span>
            </h2>
            <p className="text-gray-400 text-lg mb-12 max-w-md">
              Connect, collaborate, and excel. Everything you need for your college journey in one beautiful platform.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.05] transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <p className="text-sm font-semibold text-white mb-0.5">{feature.label}</p>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 lg:max-w-lg xl:max-w-xl flex flex-col justify-center px-6 sm:px-12 lg:px-16 relative">
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">CampusHub</span>
        </div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-gray-500 mb-8">Sign in to continue to your campus</p>

          {/* Error message */}
          {(error || authError) && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-400">{error || authError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              iconRight={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-gray-300 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
            />

            <Button type="submit" fullWidth size="lg" isLoading={isLoading} icon={<ArrowRight className="w-4 h-4" />}>
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
