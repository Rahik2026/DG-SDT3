'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Calendar, Clock, FileText, MessageSquare,
  Users, Zap, ChevronRight, Flame, Target, Bell,
  ArrowUpRight, Timer, CheckCircle2, AlertCircle,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useStore } from '@/stores/useStore';
import { toDate } from '@/lib/utils';
import { formatDistanceToNow, differenceInDays, differenceInHours, format } from 'date-fns';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

function CountdownTimer({ date }: { date: Date }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const diff = date.getTime() - now.getTime();
  if (diff <= 0) return <span className="text-red-400">Started</span>;
  const d = Math.floor(diff / 86400000); const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000); const s = Math.floor((diff % 60000) / 1000);
  return (
    <div className="flex gap-2">
      {[{ v: d, l: 'd' }, { v: h, l: 'h' }, { v: m, l: 'm' }, { v: s, l: 's' }].map(({ v, l }) => (
        <div key={l} className="flex flex-col items-center">
          <span className="text-lg font-bold text-white tabular-nums">{String(v).padStart(2, '0')}</span>
          <span className="text-[10px] text-gray-500 uppercase">{l}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { user, homework, exams, announcements, notifications, posts, users, chatRooms } = useStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const activeHw = homework.filter((h) => {
    const due = toDate(h.dueDate);
    return due > new Date();
  });
  const upcomingExams = exams.filter((e) => toDate(e.date) > new Date());
  const unread = notifications.filter((n) => !n.read).length;

  const stats = [
    { label: 'Active Homework', value: activeHw.length.toString(), icon: BookOpen, color: 'from-indigo-500 to-blue-500', textColor: 'text-indigo-400' },
    { label: 'Upcoming Exams', value: upcomingExams.length.toString(), icon: Calendar, color: 'from-emerald-500 to-teal-500', textColor: 'text-emerald-400' },
    { label: 'Community Posts', value: posts.length.toString(), icon: MessageSquare, color: 'from-purple-500 to-pink-500', textColor: 'text-purple-400' },
    { label: 'Unread Alerts', value: unread.toString(), icon: Bell, color: 'from-amber-500 to-orange-500', textColor: 'text-amber-400' },
  ];

  const nextExam = upcomingExams[0] || null;

  if (!mounted) return null;

  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">
        {/* Greeting */}
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.displayName?.split(' ')[0]}
              <motion.span animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }} className="inline-block">👋</motion.span>
            </h1>
            <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening in your campus today</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success" dot><Target className="w-3 h-3 mr-1" />{user?.department} · {user?.year}</Badge>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} hover glow>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Exam Countdown */}
            {nextExam && (
              <motion.div variants={item}>
                <Card glow>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                        <Timer className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-0.5 uppercase">Next Exam Countdown</p>
                        <p className="text-lg font-bold text-white">{nextExam.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="danger" size="sm">{nextExam.type?.toUpperCase()}</Badge>
                          <span className="text-xs text-gray-500">{format(toDate(nextExam.date), 'MMM d, yyyy')} · {nextExam.venue}</span>
                        </div>
                      </div>
                    </div>
                    <CountdownTimer date={toDate(nextExam.date)} />
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Issue #2 FIX: Real activity summary instead of fake chart */}
            <motion.div variants={item}>
              <Card>
                <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
                  <Flame className="w-4 h-4 text-amber-400" /> Activity Summary
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                    <p className="text-2xl font-bold text-indigo-400">{posts.length}</p>
                    <p className="text-[11px] text-gray-500 mt-1">Total Posts</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                    <p className="text-2xl font-bold text-purple-400">{chatRooms.length}</p>
                    <p className="text-[11px] text-gray-500 mt-1">Active Chats</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                    <p className="text-2xl font-bold text-emerald-400">{users.length}</p>
                    <p className="text-[11px] text-gray-500 mt-1">Members</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                    <p className="text-2xl font-bold text-amber-400">{homework.length}</p>
                    <p className="text-[11px] text-gray-500 mt-1">Assignments</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Homework */}
            <motion.div variants={item}>
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2"><BookOpen className="w-4 h-4 text-amber-400" /> Homework & Assignments</h3>
                  <a href="/files" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></a>
                </div>
                {homework.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6">No homework assigned yet.</p>
                ) : (
                  <div className="space-y-3">
                    {homework.slice(0, 5).map((hw) => {
                      const due = toDate(hw.dueDate);
                      const daysLeft = differenceInDays(due, new Date());
                      const isOverdue = due < new Date();
                      return (
                        <div key={hw.id} className={`p-4 rounded-xl border transition-all cursor-pointer ${isOverdue ? 'border-red-500/20 bg-red-500/[0.03]' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-semibold text-white">{hw.title}</h4>
                                {isOverdue && <Badge variant="danger" size="sm">Overdue</Badge>}
                                {!isOverdue && daysLeft <= 2 && <Badge variant="warning" size="sm" dot>Urgent</Badge>}
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-1 mb-2">{hw.description}</p>
                              <div className="flex items-center gap-3 text-[11px] text-gray-500">
                                <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{hw.subject}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{isOverdue ? `Due ${formatDistanceToNow(due, { addSuffix: true })}` : `${daysLeft}d left`}</span>
                              </div>
                              {hw.imageUrl && <div className="mt-2"><img src={hw.imageUrl} alt="" className="h-20 rounded-lg object-cover border border-white/[0.06]" /></div>}
                            </div>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isOverdue ? 'bg-red-500/10' : 'bg-indigo-500/10'}`}>
                              {isOverdue ? <AlertCircle className="w-5 h-5 text-red-400" /> : <CheckCircle2 className="w-5 h-5 text-indigo-400" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </motion.div>
          </div>

          {/* Right 1/3 */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div variants={item}>
              <Card>
                <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4"><Zap className="w-4 h-4 text-yellow-400" /> Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: MessageSquare, label: 'New Chat', color: 'from-indigo-500 to-blue-500', href: '/chat' },
                    { icon: FileText, label: 'Upload File', color: 'from-emerald-500 to-teal-500', href: '/files' },
                    { icon: BookOpen, label: 'Questions', color: 'from-purple-500 to-pink-500', href: '/questions' },
                    { icon: Calendar, label: 'Exams', color: 'from-red-500 to-orange-500', href: '/exams' },
                  ].map((action) => (
                    <a key={action.label} href={action.href} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-300">{action.label}</span>
                    </a>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Announcements */}
            <motion.div variants={item}>
              <Card>
                <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4"><Bell className="w-4 h-4 text-blue-400" /> Announcements</h3>
                {announcements.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No announcements yet.</p>
                ) : (
                  <div className="space-y-3">
                    {announcements.slice(0, 4).map((ann) => (
                      <div key={ann.id} className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${ann.priority === 'high' ? 'bg-amber-500' : ann.priority === 'medium' ? 'bg-blue-500' : 'bg-gray-500'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{ann.title}</p>
                            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{ann.content}</p>
                            <p className="text-[11px] text-gray-600 mt-1">{ann.authorName} · {formatDistanceToNow(toDate(ann.createdAt), { addSuffix: true })}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Exam Schedule Quick View */}
            <motion.div variants={item}>
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2"><Calendar className="w-4 h-4 text-red-400" /> Exam Schedule</h3>
                  <a href="/exams" className="text-xs text-indigo-400 hover:text-indigo-300">View all</a>
                </div>
                {upcomingExams.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No upcoming exams.</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingExams.slice(0, 3).map((exam) => (
                      <div key={exam.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/10 flex flex-col items-center justify-center">
                          <span className="text-xs font-bold text-red-400">{format(toDate(exam.date), 'dd')}</span>
                          <span className="text-[10px] text-red-400/70">{format(toDate(exam.date), 'MMM')}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{exam.title}</p>
                          <Badge variant={exam.type === 'final' ? 'danger' : 'warning'} size="sm">{exam.type}</Badge>
                        </div>
                        <span className="text-xs text-gray-400">{differenceInDays(toDate(exam.date), new Date())}d</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
