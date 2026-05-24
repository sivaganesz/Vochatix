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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await api.get(`/api/users/search?q=${encodeURIComponent(query)}`);
      setSearchResults(response.data.data.users as User[]);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartChat = async (targetUser: User) => {
    const conversation = await createDirectConversation(targetUser.id);
    setActiveConversation(conversation.id);
    router.push(`/chat/${conversation.id}`);
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
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
          {/* Current user */}
          {user && (
            <button 
              onClick={() => router.push('/profile')}
              className="flex items-center gap-3 px-2 hover:bg-gray-50 rounded-lg py-1.5 transition-colors text-left w-full"
              title="View my profile"
            >
              <Avatar name={user.name} avatarUrl={user.avatarUrl} size="md" isOnline />
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold text-gray-900 truncate">{user.name}</span>
                <span className="text-xs text-gray-500 truncate">{user.email}</span>
              </div>
            </button>
          )}

          {/* Inline search field */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-transparent bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* List Content (Search Results or Conversations) */}
        <div className="flex-1 overflow-y-auto">
          {searchQuery.length > 0 ? (
            // Search Results View
            <div className="py-2">
              {isSearching ? (
                <div className="flex justify-center py-6">
                  <Spinner />
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleStartChat(u)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <Avatar name={u.name} avatarUrl={u.avatarUrl} size="md" isOnline={u.isOnline} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-center text-sm text-gray-500 py-6">No users found</p>
              )}
            </div>
          ) : conversations.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500">No conversations yet</p>
              <p className="text-xs text-gray-400 mt-1">Search above to start chatting</p>
            </div>
          ) : (
            // Conversations List
            conversations.map((conv) => {
              const details = getConversationDetails(conv);
              const lastMessage = conv.messages[0];
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
          setSearchQuery('');
          setSearchResults([]);
        }}
        title="New Direct Message"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div className="min-h-[120px]">
            {isSearching ? (
              <div className="flex justify-center py-6">
                <Spinner />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-1">
                {searchResults.map((u) => (
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
            ) : searchQuery.length > 0 ? (
              <p className="text-center text-sm text-gray-500 py-6">No users found</p>
            ) : (
              <p className="text-center text-sm text-gray-400 py-6">
                Type to search for users
              </p>
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
