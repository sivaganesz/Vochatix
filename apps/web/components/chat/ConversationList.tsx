'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, MessageSquare, LogOut, Users } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useConversations } from '@/hooks/useConversations';
import { useAuthStore } from '@/store/auth.store';
import { useChatStore } from '@/store/chat.store';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types/chat.types';
import api from '@/lib/api';
import { formatRelativeTime } from '@/lib/date';
import { CreateGroupModal } from './CreateGroupModal';
import { ConversationCard } from './ConversationCard';

export function ConversationList() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { conversations, createDirectConversation, createGroupConversation, toggleMuteConversation, toggleUnreadConversation, hideConversation } = useConversations();
  const { activeConversationId, setActiveConversation, onlineUserIds } = useChatStore();
  const { logout } = useAuth();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  
  // Inline search (searches existing conversations locally)
  const [chatListQuery, setChatListQuery] = useState('');
  
  // Modal search (searches all users globally via API)
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [modalSearchResults, setModalSearchResults] = useState<User[]>([]);
  const [isModalSearching, setIsModalSearching] = useState(false);

  const handleModalSearch = async (query: string) => {
    setModalSearchQuery(query);
    if (query.length < 1) {
      setModalSearchResults([]);
      return;
    }

    setIsModalSearching(true);
    try {
      const response = await api.get(`/api/users/search?q=${encodeURIComponent(query)}`);
      setModalSearchResults(response.data.data.users as User[]);
    } catch {
      setModalSearchResults([]);
    } finally {
      setIsModalSearching(false);
    }
  };

  const handleStartChat = async (targetUser: User) => {
    try {
      const conversation = await createDirectConversation(targetUser.id);
      setActiveConversation(conversation.id);
      router.push(`/chat/${conversation.id}`);
      setIsSearchOpen(false);
      setModalSearchQuery('');
      setModalSearchResults([]);
    } catch (error) {
      console.error('Failed to start chat:', error);
      alert('Failed to start conversation. Please try again.');
    }
  };

  const handleCreateGroup = async (targetUserIds: string[], name: string) => {
    const conversation = await createGroupConversation(targetUserIds, name);
    setActiveConversation(conversation.id);
    router.push(`/chat/${conversation.id}`);
    setIsGroupOpen(false);
  };

  const handleConversationClick = (conversationId: string) => {
    setActiveConversation(conversationId);
    router.push(`/chat/${conversationId}`);
  };

  const getConversationDetails = (conv: (typeof conversations)[0]) => {
    if (conv.type === 'GROUP') {
      return {
        name: conv.name || 'Group Chat',
        avatarUrl: conv.avatarUrl,
        isOnline: false, // Could aggregate online status for groups in the future
      };
    }
    const otherUser = conv.members.find((m) => m.userId !== user?.id)?.user;
    return {
      name: otherUser?.name || 'Unknown User',
      avatarUrl: otherUser?.avatarUrl,
      isOnline: otherUser ? onlineUserIds.has(otherUser.id) : false,
    };
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                title="New Chat"
              >
                <Plus className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setIsGroupOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                title="New Group"
              >
                <Users className="h-5 w-5" />
              </button>
              <button 
                onClick={() => logout()}
                className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full text-gray-500 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Inline search field */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={chatListQuery}
              onChange={(e) => setChatListQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-transparent bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* List Content (Conversations) */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500">No conversations yet</p>
              <p className="text-xs text-gray-400 mt-1">Search above to start chatting</p>
            </div>
          ) : (
            // Conversations List
            conversations
              .filter(conv => {
                if (!chatListQuery) return true;
                const details = getConversationDetails(conv);
                return details.name.toLowerCase().includes(chatListQuery.toLowerCase());
              })
              .map((conv) => {
              const details = getConversationDetails(conv);
              const isActive = conv.id === activeConversationId;

              return (
                <ConversationCard
                  key={conv.id}
                  conversation={conv}
                  isActive={isActive}
                  details={details}
                  onClick={() => handleConversationClick(conv.id)}
                  onMute={() => toggleMuteConversation(conv.id)}
                  onMarkUnread={() => toggleUnreadConversation(conv.id)}
                  onRemove={() => hideConversation(conv.id)}
                />
              );
            })
          )}
        </div>
      </div>

      {/* User search modal for Direct Message */}
      <Modal
        isOpen={isSearchOpen}
        onClose={() => {
          setIsSearchOpen(false);
          setModalSearchQuery('');
          setModalSearchResults([]);
        }}
        title="New Direct Message"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={modalSearchQuery}
              onChange={(e) => handleModalSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div className="min-h-[120px]">
            {isModalSearching ? (
              <div className="flex justify-center py-6">
                <Spinner />
              </div>
            ) : modalSearchResults.length > 0 ? (
              <div className="space-y-1">
                {modalSearchResults.filter((u) => u.id !== user?.id).map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleStartChat(u)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <Avatar name={u.name} avatarUrl={u.avatarUrl} size="md" isOnline={u.isOnline} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : modalSearchQuery.length > 0 ? (
              <p className="text-center text-sm text-gray-500 py-6">No users found</p>
            ) : (
              <p className="text-center text-sm text-gray-500 py-6">Type a name to search</p>
            )}
          </div>
        </div>
      </Modal>
      
      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isGroupOpen}
        onClose={() => setIsGroupOpen(false)}
        onCreateGroup={handleCreateGroup}
      />
    </>
  );
}
