/**
 * Firestore CRUD helpers — all database operations go through here.
 * FIXES: #1 dept/year, #3 exams, #4 admin roles, #5 announcements,
 *        #6 homework text+image, #8 hashtags, #9 messaging, #10 exam schedule
 */
import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp,
  arrayUnion, arrayRemove, increment, Timestamp,
  type Unsubscribe, type DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';

const ts = () => serverTimestamp();
const col = (name: string) => collection(db, name);

/* ================================================================
   ADMIN EMAIL — set this to YOUR email. Only this user gets admin.
   Issue #4 fix: hardcoded admin credential
   ================================================================ */
export const ADMIN_EMAIL = 'admin@campushub.com';

// ─── USERS ──────────────────────────────────────────────
export async function createUserProfile(uid: string, data: {
  email: string;
  displayName: string;
  department?: string;
  year?: string;
}) {
  const isAdmin = data.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  await setDoc(doc(db, 'users', uid), {
    uid,
    email: data.email,
    displayName: data.displayName,
    photoURL: '',
    role: isAdmin ? 'admin' : 'student',          // Issue #4: only ADMIN_EMAIL gets admin
    department: data.department || 'Science',       // Issue #1: default Science
    year: data.year || 'First Year',                // Issue #1: year instead of semester
    bio: '',
    isOnline: true,
    lastSeen: ts(),
    createdAt: ts(),
    updatedAt: ts(),
  });
}

export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { uid: snap.id, ...snap.data() } : null;
}

export async function updateUserProfile(uid: string, data: Partial<DocumentData>) {
  await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: ts() });
}

export async function setUserOnline(uid: string, online: boolean) {
  await updateDoc(doc(db, 'users', uid), { isOnline: online, lastSeen: ts() });
}

export function subscribeUsers(callback: (users: DocumentData[]) => void): Unsubscribe {
  const q = query(col('users'), orderBy('displayName'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
  });
}

// ─── POSTS ──────────────────────────────────────────────
export async function createPost(data: {
  authorId: string;
  authorName: string;
  authorPhoto: string;
  content: string;
  tags: string[];
}) {
  const ref = await addDoc(col('posts'), {
    ...data, images: [], likes: [], commentCount: 0,
    createdAt: ts(), updatedAt: ts(),
  });
  return ref.id;
}

export function subscribePosts(callback: (posts: DocumentData[]) => void): Unsubscribe {
  const q = query(col('posts'), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function togglePostLike(postId: string, userId: string, isLiked: boolean) {
  await updateDoc(doc(db, 'posts', postId), {
    likes: isLiked ? arrayRemove(userId) : arrayUnion(userId),
  });
}

// Issue #8: admin can delete any post
export async function deletePost(postId: string) {
  await deleteDoc(doc(db, 'posts', postId));
}

// ─── HASHTAGS (Issue #8: admin-managed) ─────────────────
export async function getHashtags(): Promise<string[]> {
  const snap = await getDoc(doc(db, 'settings', 'hashtags'));
  if (snap.exists()) return snap.data().tags || [];
  return ['General', 'Homework', 'Exams', 'Events', 'Help'];
}

export async function setHashtags(tags: string[]) {
  await setDoc(doc(db, 'settings', 'hashtags'), { tags, updatedAt: ts() });
}

export function subscribeHashtags(callback: (tags: string[]) => void): Unsubscribe {
  return onSnapshot(doc(db, 'settings', 'hashtags'), (snap) => {
    callback(snap.exists() ? snap.data().tags || [] : ['General', 'Homework', 'Exams', 'Events', 'Help']);
  });
}

// ─── COMMENTS ───────────────────────────────────────────
export async function addComment(postId: string, data: {
  authorId: string; authorName: string; authorPhoto: string; content: string;
}) {
  await addDoc(collection(db, 'posts', postId, 'comments'), { ...data, createdAt: ts() });
  await updateDoc(doc(db, 'posts', postId), { commentCount: increment(1) });
}

export function subscribeComments(postId: string, callback: (c: DocumentData[]) => void): Unsubscribe {
  const q = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

// ─── CHAT ROOMS (Issue #9: proper new chat + user list) ─
export async function createChatRoom(data: {
  type: 'private' | 'group'; name: string; members: string[]; createdBy: string;
}) {
  const ref = await addDoc(col('chatRooms'), {
    ...data, avatar: '', lastMessage: '', lastMessageAt: null, lastMessageBy: '', createdAt: ts(),
  });
  return ref.id;
}

// Issue #9: find existing private chat between two users
export async function findPrivateChat(uid1: string, uid2: string): Promise<string | null> {
  const q = query(col('chatRooms'), where('type', '==', 'private'), where('members', 'array-contains', uid1));
  const snap = await getDocs(q);
  for (const d of snap.docs) {
    const members = d.data().members as string[];
    if (members.includes(uid2)) return d.id;
  }
  return null;
}

export function subscribeChatRooms(userId: string, callback: (rooms: DocumentData[]) => void): Unsubscribe {
  const q = query(col('chatRooms'), where('members', 'array-contains', userId));
  return onSnapshot(q, (snap) => {
    const rooms = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    rooms.sort((a: any, b: any) => {
      const at = a.lastMessageAt?.toMillis?.() || a.createdAt?.toMillis?.() || 0;
      const bt = b.lastMessageAt?.toMillis?.() || b.createdAt?.toMillis?.() || 0;
      return bt - at;
    });
    callback(rooms);
  });
}

// ─── MESSAGES ───────────────────────────────────────────
export async function sendChatMessage(chatRoomId: string, data: {
  senderId: string; senderName: string; senderPhoto: string; text: string;
}) {
  await addDoc(collection(db, 'chatRooms', chatRoomId, 'messages'), {
    ...data, fileAttachment: null, readBy: [data.senderId], createdAt: ts(),
  });
  await updateDoc(doc(db, 'chatRooms', chatRoomId), {
    lastMessage: data.text, lastMessageAt: ts(), lastMessageBy: data.senderId,
  });
}

export function subscribeMessages(chatRoomId: string, callback: (msgs: DocumentData[]) => void): Unsubscribe {
  const q = query(collection(db, 'chatRooms', chatRoomId, 'messages'), orderBy('createdAt', 'asc'), limit(200));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

// ─── HOMEWORK (Issue #6: text + subject + imageUrl) ─────
export async function createHomework(data: {
  title: string; description: string; subject: string;
  department: string; dueDate: Date;
  createdBy: string; createdByName: string;
  imageUrl?: string;
}) {
  await addDoc(col('homework'), {
    ...data,
    dueDate: Timestamp.fromDate(data.dueDate),
    imageUrl: data.imageUrl || '',
    status: 'active',
    submissions: [],
    createdAt: ts(),
  });
}

export function subscribeHomework(callback: (hw: DocumentData[]) => void): Unsubscribe {
  const q = query(col('homework'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export async function deleteHomework(hwId: string) {
  await deleteDoc(doc(db, 'homework', hwId));
}

// ─── EXAMS (Issue #3, #10: proper CRUD) ─────────────────
export async function createExam(data: {
  title: string; subject: string; department: string;
  date: Date; duration: number; venue: string; type: string; syllabus: string;
  createdBy: string;
}) {
  await addDoc(col('exams'), {
    ...data, date: Timestamp.fromDate(data.date), createdAt: ts(),
  });
}

export async function updateExam(examId: string, data: Partial<DocumentData>) {
  if (data.date && data.date instanceof Date) {
    data.date = Timestamp.fromDate(data.date);
  }
  await updateDoc(doc(db, 'exams', examId), { ...data });
}

export async function deleteExam(examId: string) {
  await deleteDoc(doc(db, 'exams', examId));
}

export function subscribeExams(callback: (exams: DocumentData[]) => void): Unsubscribe {
  const q = query(col('exams'), orderBy('date', 'asc'));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

// ─── ANNOUNCEMENTS (Issue #5: admin CRUD) ───────────────
export async function createAnnouncement(data: {
  title: string; content: string; priority: string; category: string;
  authorId: string; authorName: string;
}) {
  await addDoc(col('announcements'), {
    ...data, attachments: [], readBy: [], createdAt: ts(),
  });
}

export async function updateAnnouncement(annId: string, data: Partial<DocumentData>) {
  await updateDoc(doc(db, 'announcements', annId), { ...data, updatedAt: ts() });
}

export async function deleteAnnouncement(annId: string) {
  await deleteDoc(doc(db, 'announcements', annId));
}

export function subscribeAnnouncements(callback: (anns: DocumentData[]) => void): Unsubscribe {
  const q = query(col('announcements'), orderBy('createdAt', 'desc'), limit(20));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

// ─── FILES ──────────────────────────────────────────────
export async function createFileRecord(data: {
  fileId: string; fileName: string; fileType: string; fileSize: number;
  driveUrl: string; thumbnailUrl: string; category: string; subject: string;
  uploadedBy: string; uploaderName: string;
}) {
  await addDoc(col('files'), { ...data, downloads: 0, createdAt: ts() });
}

export function subscribeFiles(callback: (files: DocumentData[]) => void): Unsubscribe {
  const q = query(col('files'), orderBy('createdAt', 'desc'), limit(100));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export async function incrementDownload(fileId: string) {
  await updateDoc(doc(db, 'files', fileId), { downloads: increment(1) });
}

// ─── QUESTION BANK ──────────────────────────────────────
export function subscribeQuestionBank(callback: (qb: DocumentData[]) => void): Unsubscribe {
  const q = query(col('questionBank'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

// ─── NOTIFICATIONS ──────────────────────────────────────
export async function createNotification(data: {
  userId: string; type: string; title: string; body: string; link: string;
}) {
  await addDoc(col('notifications'), { ...data, read: false, createdAt: ts() });
}

export function subscribeNotifications(userId: string, callback: (n: DocumentData[]) => void): Unsubscribe {
  const q = query(col('notifications'), where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(30));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), () => callback([]));
}

export async function markNotifRead(notifId: string) {
  await updateDoc(doc(db, 'notifications', notifId), { read: true });
}

export async function markAllNotifsRead(userId: string) {
  const q = query(col('notifications'), where('userId', '==', userId), where('read', '==', false));
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { read: true })));
}

// ─── SEED ───────────────────────────────────────────────
export async function seedInitialData(adminUid: string, adminName: string) {
  const postsSnap = await getDocs(query(col('posts'), limit(1)));
  if (!postsSnap.empty) return false;

  await setHashtags(['General', 'Homework', 'Exams', 'Events', 'Help']);

  await createAnnouncement({
    title: 'Welcome to CampusHub! 🎉',
    content: 'Welcome to our college community platform. Post, chat, share files, and explore!',
    priority: 'high', category: 'General', authorId: adminUid, authorName: adminName,
  });

  await createPost({
    authorId: adminUid, authorName: adminName, authorPhoto: '',
    content: 'Welcome to CampusHub! 🎓\n\nShare your thoughts, ask questions, and connect with classmates.\nLet\'s build an amazing community together! 🚀',
    tags: ['Welcome', 'General'],
  });

  return true;
}
