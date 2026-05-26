'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Send, Paperclip, Smile, MoreVertical, Phone, Video,
  ArrowLeft, Users, Plus, CheckCheck, Mic, MessageSquare, X,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useStore } from '@/stores/useStore';
import { subscribeMessages } from '@/lib/firestore';
import { toDate } from '@/lib/utils';
import { format, isToday, isYesterday } from 'date-fns';
import { type DocumentData } from 'firebase/firestore';

function formatChatTime(date: Date): string {
  if (isToday(date)) return format(date, 'h:mm a');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MM/dd');
}

export default function ChatPage() {
  const { user, chatRooms, activeChatId, setActiveChatId, sendMessage, users, startPrivateChat } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [activeMessages, setActiveMessages] = useState<DocumentData[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeChat = chatRooms.find((r) => r.id === activeChatId);

  useEffect(() => {
    if (!activeChatId) { setActiveMessages([]); return; }
    const unsub = subscribeMessages(activeChatId, setActiveMessages);
    return () => unsub();
  }, [activeChatId]);

  const filteredRooms = chatRooms.filter((room) => room.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [activeMessages.length]);

  const handleSend = async () => {
    if (!messageText.trim() || !activeChatId) return;
    const text = messageText.trim();
    setMessageText('');
    await sendMessage(activeChatId, text);
    inputRef.current?.focus();
  };

  const handleSelectChat = (chatId: string) => { setActiveChatId(chatId); setShowMobileChat(true); };

  const getOtherUser = (room: DocumentData) => {
    if (room.type === 'group') return null;
    const otherId = room.members?.find((m: string) => m !== user?.uid);
    return users.find((u) => u.uid === otherId);
  };

  // Issue #9: start new private chat with a selected user
  const handleStartChat = async (otherUser: DocumentData) => {
    const chatId = await startPrivateChat(otherUser.uid, otherUser.displayName);
    if (chatId) {
      setActiveChatId(chatId);
      setShowMobileChat(true);
    }
    setShowNewChat(false);
    setUserSearch('');
  };

  // Filter users for new chat modal (exclude self)
  const availableUsers = users.filter((u) =>
    u.uid !== user?.uid &&
    u.displayName?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const groupedMessages = useMemo(() => {
    const groups: { date: string; msgs: DocumentData[] }[] = [];
    let currentDate = '';
    activeMessages.forEach((msg) => {
      const d = toDate(msg.createdAt);
      const label = isToday(d) ? 'Today' : isYesterday(d) ? 'Yesterday' : format(d, 'MMMM d, yyyy');
      if (label !== currentDate) { currentDate = label; groups.push({ date: label, msgs: [] }); }
      groups[groups.length - 1].msgs.push(msg);
    });
    return groups;
  }, [activeMessages]);

  return (
    <AppLayout>
      <div className="h-[calc(100vh-8.5rem)] flex rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.01]">
        {/* Chat list */}
        <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-white/[0.06] flex flex-col bg-[#0a0a14]/50 ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-white/[0.06]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><MessageSquare className="w-5 h-5 text-indigo-400" /> Messages</h2>
              <Button variant="ghost" size="xs" icon={<Plus className="w-4 h-4" />} onClick={() => setShowNewChat(true)}>New</Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredRooms.length === 0 && (
              <div className="p-8 text-center">
                <MessageSquare className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No conversations yet</p>
                <Button variant="outline" size="xs" className="mt-3" onClick={() => setShowNewChat(true)} icon={<Plus className="w-3.5 h-3.5" />}>Start a chat</Button>
              </div>
            )}
            {filteredRooms.map((room) => {
              const otherUser = getOtherUser(room);
              const isActive = room.id === activeChatId;
              const chatName = room.type === 'private' ? (otherUser?.displayName || room.name) : room.name;
              return (
                <div key={room.id} onClick={() => handleSelectChat(room.id)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-l-2 hover:bg-white/[0.02] ${isActive ? 'bg-indigo-500/[0.06] border-l-indigo-500' : 'border-l-transparent'}`}>
                  <div className="relative">
                    <Avatar name={chatName || 'Chat'} size="lg" isOnline={room.type === 'private' ? otherUser?.isOnline : undefined} />
                    {room.type === 'group' && <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-indigo-500/20 border-2 border-gray-900 flex items-center justify-center"><Users className="w-2.5 h-2.5 text-indigo-400" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white truncate">{chatName}</span>
                      {room.lastMessageAt && <span className="text-[10px] text-gray-500 flex-shrink-0 ml-2">{formatChatTime(toDate(room.lastMessageAt))}</span>}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{room.lastMessage || 'No messages yet'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat area */}
        <div className={`flex-1 flex flex-col ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          {activeChat ? (
            <>
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#0a0a14]/50">
                <div className="flex items-center gap-3">
                  <button onClick={() => { setShowMobileChat(false); setActiveChatId(null); }} className="md:hidden p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-400"><ArrowLeft className="w-5 h-5" /></button>
                  <Avatar name={activeChat.type === 'private' ? (getOtherUser(activeChat)?.displayName || activeChat.name) : activeChat.name} size="md" isOnline={activeChat.type === 'private' ? getOtherUser(activeChat)?.isOnline : undefined} />
                  <div>
                    <h3 className="text-sm font-semibold text-white">{activeChat.type === 'private' ? (getOtherUser(activeChat)?.displayName || activeChat.name) : activeChat.name}</h3>
                    <p className="text-xs text-gray-500">{activeChat.type === 'group' ? `${activeChat.members?.length || 0} members` : getOtherUser(activeChat)?.isOnline ? 'Online' : 'Offline'}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {activeMessages.length === 0 && <div className="flex flex-col items-center justify-center h-full"><MessageSquare className="w-12 h-12 text-gray-700 mb-3" /><p className="text-sm text-gray-500">Send a message to start the conversation</p></div>}
                {groupedMessages.map((group) => (
                  <div key={group.date}>
                    <div className="flex items-center justify-center py-4"><span className="px-3 py-1 rounded-full bg-white/[0.04] text-[11px] text-gray-500 font-medium">{group.date}</span></div>
                    {group.msgs.map((msg, i) => {
                      const isMine = msg.senderId === user?.uid;
                      const showAvatar = !isMine && (i === 0 || group.msgs[i - 1]?.senderId !== msg.senderId);
                      const isLast = i === group.msgs.length - 1 || group.msgs[i + 1]?.senderId !== msg.senderId;
                      return (
                        <div key={msg.id} className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'} ${isLast ? 'mb-3' : 'mb-0.5'}`}>
                          {!isMine && <div className="w-7 flex-shrink-0">{showAvatar && <Avatar name={msg.senderName || '?'} size="xs" />}</div>}
                          <div className="max-w-[70%]">
                            {showAvatar && !isMine && activeChat.type === 'group' && <p className="text-[11px] text-indigo-400 font-medium ml-3 mb-0.5">{msg.senderName}</p>}
                            <div className={`px-3.5 py-2 text-sm leading-relaxed ${isMine ? `bg-gradient-to-br from-indigo-600 to-indigo-700 text-white ${isLast ? 'rounded-2xl rounded-br-md' : 'rounded-2xl'}` : `bg-white/[0.06] text-gray-200 ${isLast ? 'rounded-2xl rounded-bl-md' : 'rounded-2xl'}`}`}>
                              {msg.text}
                              <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : ''}`}>
                                <span className="text-[10px] opacity-50">{format(toDate(msg.createdAt), 'h:mm a')}</span>
                                {isMine && <CheckCheck className="w-3 h-3 text-indigo-300/60" />}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-white/[0.06] bg-[#0a0a14]/50">
                <div className="flex items-center gap-2">
                  <input ref={inputRef} type="text" placeholder="Type a message..." value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                  <button onClick={handleSend} disabled={!messageText.trim()}
                    className={`p-2.5 rounded-xl transition-all ${messageText.trim() ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25' : 'bg-white/[0.04] text-gray-600'}`}>
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center mb-6"><MessageSquare className="w-12 h-12 text-indigo-400/50" /></div>
              <h3 className="text-xl font-bold text-white mb-2">Your Messages</h3>
              <p className="text-sm text-gray-500 max-w-xs">Select a conversation or start a new one</p>
              <Button variant="outline" size="sm" className="mt-6" icon={<Plus className="w-4 h-4" />} onClick={() => setShowNewChat(true)}>Start New Chat</Button>
            </div>
          )}
        </div>
      </div>

      {/* Issue #9: New Chat Modal — shows registered students */}
      <Modal isOpen={showNewChat} onClose={() => { setShowNewChat(false); setUserSearch(''); }} title="New Conversation" size="md">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" placeholder="Search students..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40" autoFocus />
          </div>
          <div className="max-h-80 overflow-y-auto space-y-1">
            {availableUsers.length === 0 && <p className="text-sm text-gray-500 text-center py-6">No other students found.</p>}
            {availableUsers.map((u) => (
              <button key={u.uid} onClick={() => handleStartChat(u)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors text-left">
                <Avatar name={u.displayName} size="md" isOnline={u.isOnline} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{u.displayName}</p>
                  <p className="text-xs text-gray-500">{u.department} · {u.year || 'Student'}</p>
                </div>
                <MessageSquare className="w-4 h-4 text-gray-600" />
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
