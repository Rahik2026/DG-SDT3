'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Plus, Trash2, Clock, MapPin, BookOpen, AlertCircle } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useStore } from '@/stores/useStore';
import { toDate } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';

export default function ExamsPage() {
  const { exams, isAdmin, addExam, removeExam } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', subject: '', department: 'Science', date: '', duration: '180', venue: '', type: 'midterm', syllabus: '' });
  const [error, setError] = useState('');

  const handleAdd = async () => {
    setError('');
    if (!form.title || !form.subject || !form.date || !form.venue) { setError('Please fill all required fields.'); return; }
    await addExam({ ...form, date: new Date(form.date), duration: Number(form.duration) });
    setForm({ title: '', subject: '', department: 'Science', date: '', duration: '180', venue: '', type: 'midterm', syllabus: '' });
    setShowAdd(false);
  };

  const upcoming = exams.filter((e) => toDate(e.date) > new Date());
  const past = exams.filter((e) => toDate(e.date) <= new Date());

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2"><CalendarDays className="w-6 h-6 text-red-400" /> Exam Schedule</h1>
            <p className="text-sm text-gray-500 mt-1">View and manage exam schedules</p>
          </div>
          {isAdmin && <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowAdd(true)}>Add Exam</Button>}
        </div>

        {/* Upcoming */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Upcoming Exams ({upcoming.length})</h2>
          {upcoming.length === 0 && <Card><p className="text-sm text-gray-500 text-center py-8">No upcoming exams scheduled.</p></Card>}
          <div className="space-y-3">
            {upcoming.map((exam) => {
              const d = toDate(exam.date);
              const daysLeft = differenceInDays(d, new Date());
              return (
                <Card key={exam.id} hover>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/10 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-red-400">{format(d, 'dd')}</span>
                      <span className="text-[10px] text-red-400/70">{format(d, 'MMM')}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-white">{exam.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{exam.subject}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant={exam.type === 'final' ? 'danger' : exam.type === 'midterm' ? 'warning' : 'info'} size="sm">{exam.type}</Badge>
                        <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{exam.duration} min</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{exam.venue}</span>
                      </div>
                      {exam.syllabus && <p className="text-xs text-gray-600 mt-2 flex items-start gap-1"><BookOpen className="w-3 h-3 mt-0.5 flex-shrink-0" />{exam.syllabus}</p>}
                    </div>
                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                      <Badge variant={daysLeft <= 3 ? 'danger' : daysLeft <= 7 ? 'warning' : 'default'} dot>{daysLeft}d left</Badge>
                      {isAdmin && <button onClick={() => removeExam(exam.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Past */}
        {past.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Past Exams ({past.length})</h2>
            <div className="space-y-2">
              {past.map((exam) => (
                <Card key={exam.id} className="opacity-60">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-800 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-gray-500">{format(toDate(exam.date), 'dd')}</span>
                      <span className="text-[9px] text-gray-600">{format(toDate(exam.date), 'MMM')}</span>
                    </div>
                    <div className="flex-1"><p className="text-sm text-gray-400">{exam.title}</p><p className="text-xs text-gray-600">{exam.subject}</p></div>
                    {isAdmin && <button onClick={() => removeExam(exam.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Add Exam Modal */}
        <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Exam" size="lg">
          <div className="space-y-4">
            {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-sm text-red-400"><AlertCircle className="w-4 h-4" />{error}</div>}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-gray-300 mb-1 block">Title *</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40" placeholder="Midterm Exam" /></div>
              <div><label className="text-sm text-gray-300 mb-1 block">Subject *</label><input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40" placeholder="Physics" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-sm text-gray-300 mb-1 block">Date *</label><input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40" /></div>
              <div><label className="text-sm text-gray-300 mb-1 block">Duration (min)</label><input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40" /></div>
              <div><label className="text-sm text-gray-300 mb-1 block">Venue *</label><input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40" placeholder="Hall A" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-gray-300 mb-1 block">Type</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none appearance-none"><option value="midterm">Midterm</option><option value="final">Final</option><option value="quiz">Quiz</option><option value="practical">Practical</option></select></div>
              <div><label className="text-sm text-gray-300 mb-1 block">Department</label><select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none appearance-none"><option>Science</option><option>Arts</option><option>Commerce</option></select></div>
            </div>
            <div><label className="text-sm text-gray-300 mb-1 block">Syllabus</label><textarea value={form.syllabus} onChange={(e) => setForm({ ...form, syllabus: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none" placeholder="Topics covered..." /></div>
            <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button><Button onClick={handleAdd} icon={<Plus className="w-4 h-4" />}>Add Exam</Button></div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
