'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight,
  User, Building, Sparkles, AlertCircle,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useStore } from '@/stores/useStore';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Science');
  const [year, setYear] = useState('First Year');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { signup, isLoading, isAuthenticated, authInitialized, authError } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (authInitialized && isAuthenticated) router.push('/dashboard');
  }, [isAuthenticated, authInitialized, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Please enter your full name.'); return; }
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    try {
      await signup(name.trim(), email.trim(), password, department, year);
    } catch (err: any) { setError(err.message || 'Signup failed.'); }
  };

  if (!authInitialized) {
    return (
      <div className="min-h-screen bg-[#07070e] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070e] flex items-center justify-center px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-gray-500 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Join the CampusHub community
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-6 sm:p-8">
          {(error || authError) && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-400">{error || authError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} icon={<User className="w-4 h-4" />} required />
            <Input label="Email" type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail className="w-4 h-4" />} required />

            <div className="grid grid-cols-2 gap-3">
              {/* Issue #1: Department = Science, Arts, Commerce ONLY */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Department</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <select value={department} onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 appearance-none">
                    <option value="Science">Science</option>
                    <option value="Arts">Arts</option>
                    <option value="Commerce">Commerce</option>
                  </select>
                </div>
              </div>
              {/* Issue #1: Year = First Year, Second Year ONLY */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Year</label>
                <select value={year} onChange={(e) => setYear(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 appearance-none">
                  <option value="First Year">First Year</option>
                  <option value="Second Year">Second Year</option>
                </select>
              </div>
            </div>

            <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} icon={<Lock className="w-4 h-4" />}
              iconRight={<button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-gray-300 transition-colors">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>}
              required />

            <Button type="submit" fullWidth size="lg" isLoading={isLoading} icon={<ArrowRight className="w-4 h-4" />} className="mt-2">Create Account</Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account? <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
