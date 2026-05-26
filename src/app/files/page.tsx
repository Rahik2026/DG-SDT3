'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Upload, Search, Filter, Grid3X3, List, FileText, Download,
  Eye, MoreHorizontal, FolderOpen, BookOpen, ClipboardList,
  GraduationCap, Files as FilesIcon, HardDrive, Cloud, ExternalLink,
  Calendar, User, SortAsc,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Modal from '@/components/ui/Modal';
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

const categories = [
  { id: 'all', label: 'All Files', icon: FilesIcon, color: 'from-indigo-500 to-blue-500' },
  { id: 'notes', label: 'Notes', icon: BookOpen, color: 'from-emerald-500 to-teal-500' },
  { id: 'assignment', label: 'Assignments', icon: ClipboardList, color: 'from-amber-500 to-orange-500' },
  { id: 'question_paper', label: 'Question Papers', icon: FileText, color: 'from-purple-500 to-pink-500' },
  { id: 'syllabus', label: 'Syllabus', icon: GraduationCap, color: 'from-cyan-500 to-blue-500' },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

const fileColors: Record<string, string> = {
  pdf: 'from-red-500 to-rose-600',
  doc: 'from-blue-500 to-indigo-600',
  image: 'from-purple-500 to-pink-600',
  other: 'from-gray-500 to-gray-600',
};

export default function FilesPage() {
  const { files } = useStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUpload, setShowUpload] = useState(false);

  const filteredFiles = files.filter((file) => {
    const matchesCategory = activeCategory === 'all' || file.category === activeCategory;
    const matchesSearch = file.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalSize = files.reduce((sum, f) => sum + f.fileSize, 0);

  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <HardDrive className="w-6 h-6 text-indigo-400" />
              File Manager
            </h1>
            <p className="text-sm text-gray-500 mt-1">All files stored securely on Google Drive</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-emerald-400 font-medium">Google Drive Connected</span>
            </div>
            <Button icon={<Upload className="w-4 h-4" />} onClick={() => setShowUpload(true)}>
              Upload
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Files', value: files.length.toString(), icon: FilesIcon, color: 'text-indigo-400' },
            { label: 'Total Size', value: formatFileSize(totalSize), icon: HardDrive, color: 'text-emerald-400' },
            { label: 'Downloads', value: files.reduce((s, f) => s + f.downloads, 0).toString(), icon: Download, color: 'text-purple-400' },
            { label: 'Contributors', value: '12', icon: User, color: 'text-amber-400' },
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

        {/* Filters & Search */}
        <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
          {/* Category tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap
                  ${activeCategory === cat.id
                    ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                    : 'bg-white/[0.03] text-gray-400 border border-white/[0.06] hover:bg-white/[0.06]'
                  }
                `}
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 sm:ml-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-56 pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <div className="flex items-center bg-white/[0.03] rounded-xl border border-white/[0.06] p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white/[0.08] text-white' : 'text-gray-500'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white/[0.08] text-white' : 'text-gray-500'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Files grid/list */}
        {viewMode === 'grid' ? (
          <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFiles.map((file) => (
              <Card key={file.id} hover>
                {/* File type icon */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${fileColors[file.fileType] || fileColors.other} flex items-center justify-center shadow-lg`}>
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* File info */}
                <h4 className="text-sm font-semibold text-white truncate mb-1">{file.fileName}</h4>
                <p className="text-xs text-gray-500 mb-3">{file.subject}</p>

                {/* Meta */}
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={
                    file.category === 'notes' ? 'success' :
                    file.category === 'assignment' ? 'warning' :
                    file.category === 'question_paper' ? 'purple' : 'info'
                  } size="sm">
                    {file.category.replace('_', ' ')}
                  </Badge>
                  <span className="text-[11px] text-gray-600">{formatFileSize(file.fileSize)}</span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <Avatar name={file.uploaderName} size="xs" />
                    <div>
                      <p className="text-[11px] text-gray-400">{file.uploaderName}</p>
                      <p className="text-[10px] text-gray-600">{formatDistanceToNow(toDate(file.createdAt), { addSuffix: true })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-indigo-400 transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-emerald-400 transition-colors">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-blue-400 transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Download count */}
                <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-600">
                  <Download className="w-3 h-3" />
                  {file.downloads} downloads
                </div>
              </Card>
            ))}
          </motion.div>
        ) : (
          <motion.div variants={item}>
            <Card padding="none">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/[0.06] text-xs font-medium text-gray-500">
                <div className="col-span-5">File Name</div>
                <div className="col-span-2 hidden sm:block">Category</div>
                <div className="col-span-1 hidden md:block">Size</div>
                <div className="col-span-2 hidden lg:block">Uploaded By</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              {filteredFiles.map((file) => (
                <motion.div
                  key={file.id}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                  className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/[0.04] items-center"
                >
                  <div className="col-span-5 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${fileColors[file.fileType] || fileColors.other} flex items-center justify-center flex-shrink-0`}>
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{file.fileName}</p>
                      <p className="text-[11px] text-gray-500">{file.subject}</p>
                    </div>
                  </div>
                  <div className="col-span-2 hidden sm:block">
                    <Badge size="sm" variant={
                      file.category === 'notes' ? 'success' :
                      file.category === 'assignment' ? 'warning' :
                      file.category === 'question_paper' ? 'purple' : 'info'
                    }>
                      {file.category.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="col-span-1 hidden md:block text-xs text-gray-500">
                    {formatFileSize(file.fileSize)}
                  </div>
                  <div className="col-span-2 hidden lg:flex items-center gap-2">
                    <Avatar name={file.uploaderName} size="xs" />
                    <span className="text-xs text-gray-400 truncate">{file.uploaderName}</span>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-white transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-white transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </Card>
          </motion.div>
        )}

        {/* Upload Modal */}
        <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload to Google Drive" size="lg">
          <div className="space-y-5">
            <div className="border-2 border-dashed border-white/[0.08] rounded-2xl p-8 text-center hover:border-indigo-500/30 transition-colors cursor-pointer">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
                <Cloud className="w-7 h-7 text-indigo-400" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">Drop files here or click to browse</h4>
              <p className="text-xs text-gray-500">Files will be uploaded to Google Drive. Max 50MB per file.</p>
              <p className="text-xs text-indigo-400/60 mt-2">PDF, DOC, DOCX, PPT, PPTX, Images</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block">Category</label>
                <select className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 appearance-none">
                  <option>Notes</option>
                  <option>Assignment</option>
                  <option>Question Paper</option>
                  <option>Syllabus</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block">Subject</label>
                <input
                  placeholder="e.g., Data Structures"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowUpload(false)}>Cancel</Button>
              <Button icon={<Upload className="w-4 h-4" />}>Upload to Drive</Button>
            </div>
          </div>
        </Modal>
      </motion.div>
    </AppLayout>
  );
}
