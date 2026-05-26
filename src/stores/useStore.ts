'use client';

import { create } from 'zustand';
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile, type User as FirebaseUser,
} from 'firebase/auth';
import { type DocumentData } from 'firebase/firestore';
import { auth } from '@/lib/firebase';
import {
  createUserProfile, getUserProfile, setUserOnline, subscribeUsers,
  subscribePosts, createPost, togglePostLike, deletePost as deletePostFn,
  subscribeChatRooms, subscribeMessages, sendChatMessage,
  subscribeHomework, createHomework as createHwFn, deleteHomework as deleteHwFn,
  subscribeExams, createExam as createExamFn, deleteExam as deleteExamFn,
  subscribeAnnouncements, createAnnouncement as createAnnFn,
  updateAnnouncement as updateAnnFn, deleteAnnouncement as deleteAnnFn,
  subscribeFiles, subscribeQuestionBank,
  subscribeNotifications, markNotifRead, markAllNotifsRead,
  createChatRoom, findPrivateChat, seedInitialData,
  subscribeHashtags, setHashtags as setHashtagsFn,
  ADMIN_EMAIL,
} from '@/lib/firestore';

interface UserProfile {
  uid: string; email: string; displayName: string; photoURL: string;
  role: string; department: string; year: string; bio: string; isOnline: boolean;
  [key: string]: unknown;
}

interface AppState {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  authInitialized: boolean;
  isDarkMode: boolean;
  sidebarOpen: boolean;

  users: DocumentData[];
  posts: DocumentData[];
  chatRooms: DocumentData[];
  messages: Record<string, DocumentData[]>;
  homework: DocumentData[];
  exams: DocumentData[];
  announcements: DocumentData[];
  files: DocumentData[];
  questionBank: DocumentData[];
  notifications: DocumentData[];
  hashtags: string[];
  activeChatId: string | null;

  isAdmin: boolean;

  initAuth: () => () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, department?: string, year?: string) => Promise<void>;
  logout: () => Promise<void>;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setActiveChatId: (id: string | null) => void;
  addPost: (content: string, tags: string[]) => Promise<void>;
  toggleLike: (postId: string) => void;
  removePost: (postId: string) => Promise<void>;
  sendMessage: (chatRoomId: string, text: string) => Promise<void>;
  startPrivateChat: (otherUid: string, otherName: string) => Promise<string>;
  createNewChat: (type: 'private' | 'group', name: string, members: string[]) => Promise<string>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Admin actions
  addAnnouncement: (title: string, content: string, priority: string) => Promise<void>;
  editAnnouncement: (id: string, data: { title?: string; content?: string; priority?: string }) => Promise<void>;
  removeAnnouncement: (id: string) => Promise<void>;
  addExam: (data: { title: string; subject: string; department: string; date: Date; duration: number; venue: string; type: string; syllabus: string }) => Promise<void>;
  removeExam: (id: string) => Promise<void>;
  addHomework: (data: { title: string; description: string; subject: string; department: string; dueDate: Date; imageUrl?: string }) => Promise<void>;
  removeHomework: (id: string) => Promise<void>;
  updateHashtags: (tags: string[]) => Promise<void>;

  _unsubscribers: (() => void)[];
  _subscribeToData: (uid: string) => void;
  _cleanupSubscriptions: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  user: null, firebaseUser: null, isAuthenticated: false, isLoading: false,
  authError: null, authInitialized: false, isDarkMode: true, sidebarOpen: true,
  isAdmin: false,

  users: [], posts: [], chatRooms: [], messages: {}, homework: [],
  exams: [], announcements: [], files: [], questionBank: [],
  notifications: [], hashtags: [], activeChatId: null, _unsubscribers: [],

  initAuth: () => {
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let profile = await getUserProfile(firebaseUser.uid);
        if (!profile) {
          await createUserProfile(firebaseUser.uid, {
            email: firebaseUser.email || '', displayName: firebaseUser.displayName || 'User',
          });
          profile = await getUserProfile(firebaseUser.uid);
        }
        await setUserOnline(firebaseUser.uid, true);
        const isAdmin = (profile as any)?.role === 'admin';
        set({
          firebaseUser, user: profile as UserProfile,
          isAuthenticated: true, isLoading: false, authError: null,
          authInitialized: true, isAdmin,
        });
        get()._subscribeToData(firebaseUser.uid);
      } else {
        get()._cleanupSubscriptions();
        set({
          firebaseUser: null, user: null, isAuthenticated: false,
          isLoading: false, authInitialized: true, isAdmin: false,
          posts: [], chatRooms: [], messages: {}, homework: [],
          exams: [], announcements: [], files: [], questionBank: [],
          notifications: [], users: [], hashtags: [],
        });
      }
    });
    return () => { unsubAuth(); get()._cleanupSubscriptions(); };
  },

  _subscribeToData: (uid: string) => {
    get()._cleanupSubscriptions();
    const unsubs: (() => void)[] = [];
    unsubs.push(subscribeUsers((users) => set({ users })));
    unsubs.push(subscribePosts((posts) => set({ posts })));
    unsubs.push(subscribeChatRooms(uid, (chatRooms) => set({ chatRooms })));
    unsubs.push(subscribeHomework((homework) => set({ homework })));
    unsubs.push(subscribeExams((exams) => set({ exams })));
    unsubs.push(subscribeAnnouncements((announcements) => set({ announcements })));
    unsubs.push(subscribeFiles((files) => set({ files })));
    unsubs.push(subscribeQuestionBank((questionBank) => set({ questionBank })));
    unsubs.push(subscribeNotifications(uid, (notifications) => set({ notifications })));
    unsubs.push(subscribeHashtags((hashtags) => set({ hashtags })));
    set({ _unsubscribers: unsubs });
  },

  _cleanupSubscriptions: () => {
    get()._unsubscribers.forEach((fn) => fn());
    set({ _unsubscribers: [] });
  },

  login: async (email, password) => {
    set({ isLoading: true, authError: null });
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      let msg = 'Login failed. Please try again.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') msg = 'Invalid email or password.';
      if (error.code === 'auth/wrong-password') msg = 'Incorrect password.';
      if (error.code === 'auth/invalid-email') msg = 'Invalid email address.';
      if (error.code === 'auth/too-many-requests') msg = 'Too many attempts. Please try later.';
      set({ isLoading: false, authError: msg });
      throw new Error(msg);
    }
  },

  signup: async (name, email, password, department, year) => {
    set({ isLoading: true, authError: null });
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await createUserProfile(cred.user.uid, {
        email, displayName: name,
        department: department || 'Science',
        year: year || 'First Year',
      });
      await seedInitialData(cred.user.uid, name);
    } catch (error: any) {
      let msg = 'Signup failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') msg = 'An account with this email already exists.';
      if (error.code === 'auth/weak-password') msg = 'Password must be at least 6 characters.';
      if (error.code === 'auth/invalid-email') msg = 'Invalid email address.';
      set({ isLoading: false, authError: msg });
      throw new Error(msg);
    }
  },

  logout: async () => {
    const { user } = get();
    if (user?.uid) { try { await setUserOnline(user.uid, false); } catch {} }
    await signOut(auth);
  },

  toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setActiveChatId: (id) => set({ activeChatId: id }),

  addPost: async (content, tags) => {
    const user = get().user;
    if (!user) return;
    await createPost({ authorId: user.uid, authorName: user.displayName, authorPhoto: user.photoURL || '', content, tags });
  },

  toggleLike: (postId) => {
    const user = get().user;
    if (!user) return;
    const post = get().posts.find((p) => p.id === postId);
    if (!post) return;
    togglePostLike(postId, user.uid, post.likes?.includes(user.uid));
  },

  removePost: async (postId) => { await deletePostFn(postId); },

  sendMessage: async (chatRoomId, text) => {
    const user = get().user;
    if (!user) return;
    await sendChatMessage(chatRoomId, { senderId: user.uid, senderName: user.displayName, senderPhoto: user.photoURL || '', text });
  },

  // Issue #9: start a private chat with another user
  startPrivateChat: async (otherUid, otherName) => {
    const user = get().user;
    if (!user) return '';
    const existing = await findPrivateChat(user.uid, otherUid);
    if (existing) return existing;
    return await createChatRoom({
      type: 'private', name: otherName,
      members: [user.uid, otherUid], createdBy: user.uid,
    });
  },

  createNewChat: async (type, name, members) => {
    const user = get().user;
    if (!user) return '';
    return await createChatRoom({ type, name, members, createdBy: user.uid });
  },

  markNotificationRead: (id) => { markNotifRead(id); },
  markAllNotificationsRead: () => { const u = get().user; if (u) markAllNotifsRead(u.uid); },

  // ─── ADMIN ACTIONS ────────────────────────────────────
  addAnnouncement: async (title, content, priority) => {
    const user = get().user;
    if (!user || !get().isAdmin) return;
    await createAnnFn({ title, content, priority, category: 'General', authorId: user.uid, authorName: user.displayName });
  },
  editAnnouncement: async (id, data) => { if (!get().isAdmin) return; await updateAnnFn(id, data); },
  removeAnnouncement: async (id) => { if (!get().isAdmin) return; await deleteAnnFn(id); },

  addExam: async (data) => {
    const user = get().user;
    if (!user || !get().isAdmin) return;
    await createExamFn({ ...data, createdBy: user.uid });
  },
  removeExam: async (id) => { if (!get().isAdmin) return; await deleteExamFn(id); },

  addHomework: async (data) => {
    const user = get().user;
    if (!user) return;
    await createHwFn({ ...data, createdBy: user.uid, createdByName: user.displayName, imageUrl: data.imageUrl || '' });
  },
  removeHomework: async (id) => { await deleteHwFn(id); },

  updateHashtags: async (tags) => { if (!get().isAdmin) return; await setHashtagsFn(tags); },
}));
