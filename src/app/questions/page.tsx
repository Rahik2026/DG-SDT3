'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Search, Filter, Download, Eye, Calendar,
  FileText, GraduationCap, Award, TrendingUp, ChevronDown,
  ExternalLink, Star, Clock, User,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import { useStore } from '@/stores/useStore';
import { formatDistanceToNow } from 'date-fns';
import { toDate } from '@/lib/utils';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const subjects = [
  'All Subjects',
  'Data Structures & Algorithms',
  'Machine Learning',
  'Database Management',
  'Computer Networks',
  'Operating Systems',
];

const examTypes = [
  { id: 'all', label: 'All Types' },
  { id: 'midterm', label: 'Midterm' },
  { id: 'final', label: 'Final' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'practice', label: 'Practice' },
];

const typeColors: Record<string, { variant: 'danger' | 'warning' | 'info' | 'success' | 'purple'; icon: typeof FileText }> = {
  midterm: { variant: 'warning', icon: Clock },
  final: { variant: 'danger', icon: Award },
  quiz: { variant: 'info', icon: FileText },
  practice: { variant: 'success', icon: BookOpen },
};

export default function QuestionsPage() {
  const { questionBank } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedType, setSelectedType] = useState('all');

  const filteredQuestions = questionBank.filter((q) => {
    const matchesSubject = selectedSubject === 'All Subjects' || q.subject === selectedSubject;
    const matchesType = selectedType === 'all' || q.type === selectedType;
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesType && matchesSearch;
  });

  const totalDownloads = questionBank.reduce((s, q) => s + q.downloads, 0);

  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-400" />
              Question Bank
            </h1>
            <p className="text-sm text-gray-500 mt-1">Access past papers and practice questions</p>
          </div>
          <Button icon={<FileText className="w-4 h-4" />}>
            Upload Paper
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Papers', value: questionBank.length.toString(), icon: FileText, color: 'text-indigo-400' },
            { label: 'Subjects', value: new Set(questionBank.map(q => q.subject)).size.toString(), icon: BookOpen, color: 'text-emerald-400' },
            { label: 'Downloads', value: totalDownloads.toString(), icon: Download, color: 'text-purple-400' },
            { label: 'Contributors', value: new Set(questionBank.map(q => q.uploadedBy)).size.toString(), icon: User, color: 'text-amber-400' },
          ].map((stat) => (
            <Card key={stat.label} padding="sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-[11px] text-gray-500">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search questions, subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                {subjects.map((s) => (
                  <option key={s} value={s} className="bg-gray-900">{s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* Type tabs */}
        <motion.div variants={item} className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {examTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`
                px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap
                ${selectedType === type.id
                  ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                  : 'bg-white/[0.03] text-gray-400 border border-white/[0.06] hover:bg-white/[0.06]'
                }
              `}
            >
              {type.label}
            </button>
          ))}
        </motion.div>

        {/* Question papers grid */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuestions.map((q) => {
            const typeInfo = typeColors[q.type] || typeColors.practice;
            const TypeIcon = typeInfo.icon;

            return (
              <Card key={q.id} hover glow>
                <div className="flex items-start gap-4">
                  {/* Type icon */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/10 flex items-center justify-center flex-shrink-0">
                    <TypeIcon className="w-7 h-7 text-indigo-400" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white mb-1">{q.title}</h4>
                    <p className="text-xs text-gray-500 mb-2">{q.subject}</p>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant={typeInfo.variant} size="sm">{q.type}</Badge>
                      <Badge variant="default" size="sm">
                        <Calendar className="w-2.5 h-2.5 mr-1" /> {q.year}
                      </Badge>
                      <Badge variant="default" size="sm">
                        <GraduationCap className="w-2.5 h-2.5 mr-1" /> Sem {q.semester}
                      </Badge>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <Avatar name={q.uploaderName} size="xs" />
                        <div>
                          <p className="text-[11px] text-gray-400">{q.uploaderName}</p>
                          <p className="text-[10px] text-gray-600">
                            {formatDistanceToNow(toDate(q.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-gray-500 flex items-center gap-1">
                          <Download className="w-3 h-3" /> {q.downloads}
                        </span>
                        <Button variant="ghost" size="xs" icon={<Eye className="w-3.5 h-3.5" />}>
                          View
                        </Button>
                        <Button variant="outline" size="xs" icon={<Download className="w-3.5 h-3.5" />}>
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </motion.div>

        {filteredQuestions.length === 0 && (
          <motion.div variants={item} className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.05] flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">No papers found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters or search query</p>
          </motion.div>
        )}
      </motion.div>
    </AppLayout>
  );
}
