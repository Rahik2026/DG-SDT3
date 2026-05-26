import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'student' | 'admin' | 'moderator';
  department: string;
  semester: number;
  bio: string;
  isOnline: boolean;
  lastSeen: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  content: string;
  images: DriveFile[];
  likes: string[];
  commentCount: number;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  content: string;
  createdAt: Timestamp;
}

export interface ChatRoom {
  id: string;
  type: 'private' | 'group';
  name: string;
  avatar: string;
  members: string[];
  lastMessage: string;
  lastMessageAt: Timestamp | null;
  lastMessageBy: string;
  createdBy: string;
  createdAt: Timestamp;
  unreadCount?: Record<string, number>;
  typingUsers?: string[];
}

export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  senderPhoto: string;
  text: string;
  fileAttachment?: DriveFile | null;
  readBy: string[];
  createdAt: Timestamp;
}

export interface DriveFile {
  id: string;
  fileId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  driveUrl: string;
  thumbnailUrl: string;
  category: 'notes' | 'assignment' | 'question_paper' | 'syllabus' | 'other' | 'image' | 'chat_attachment';
  subject: string;
  semester: number;
  uploadedBy: string;
  uploaderName: string;
  downloads: number;
  createdAt: Timestamp;
}

export interface Homework {
  id: string;
  title: string;
  description: string;
  subject: string;
  semester: number;
  department: string;
  dueDate: Timestamp;
  attachments: DriveFile[];
  createdBy: string;
  createdByName: string;
  status: 'active' | 'completed' | 'overdue';
  submissions: HomeworkSubmission[];
  createdAt: Timestamp;
}

export interface HomeworkSubmission {
  userId: string;
  userName: string;
  file: DriveFile;
  submittedAt: Timestamp;
  grade?: string;
  feedback?: string;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  semester: number;
  department: string;
  date: Timestamp;
  duration: number;
  venue: string;
  type: 'midterm' | 'final' | 'quiz' | 'practical';
  syllabus: string;
  createdBy: string;
  createdAt: Timestamp;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  authorId: string;
  authorName: string;
  attachments: DriveFile[];
  readBy: string[];
  createdAt: Timestamp;
  expiresAt?: Timestamp;
}

export interface QuestionBank {
  id: string;
  title: string;
  subject: string;
  semester: number;
  year: number;
  type: 'midterm' | 'final' | 'quiz' | 'practice';
  file: DriveFile;
  uploadedBy: string;
  uploaderName: string;
  downloads: number;
  createdAt: Timestamp;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'message' | 'homework' | 'exam' | 'announcement' | 'file';
  title: string;
  body: string;
  link: string;
  read: boolean;
  createdAt: Timestamp;
}
