'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, MessageSquare, LogOut } from 'lucide-react';
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

export function ConversationList() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { conversations, createDirectConversation } = useConversations();
  const { activeConversationId, setActiveConversation, onlineUserIds } = useChatStore();
  const { logout } = useAuth();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
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

  const handleConversationClick = (conversationId: string) => {
    setActiveConversation(conversationId);
    router.push(`/chat/${conversationId}`);
  };

  const getOtherUser = (conv: (typeof conversations)[0]) => {
    return conv.members.find((m) => m.userId !== user?.id)?.user;
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                title="New conversation"
              >
                <Plus className="h-5 w-5" />
              </button>
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Current user */}
          {user && (
            <button 
              onClick={() => router.push('/profile')}
              className="flex items-center gap-2 px-2 hover:bg-gray-50 rounded-lg py-1.5 transition-colors text-left w-full"
              title="View my profile"
            >
              <Avatar name={user.name} avatarUrl={user.avatarUrl} size="sm" isOnline />
              <span className="text-sm font-medium text-gray-700 truncate">{user.name}</span>
            </button>
          )}
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500">No conversations yet</p>
              <p className="text-xs text-gray-400 mt-1">Click + to start chatting</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const otherUser = getOtherUser(conv);
              const lastMessage = conv.messages[0];
              const isOnline = otherUser ? onlineUserIds.has(otherUser.id) : false;
              const isActive = conv.id === activeConversationId;

              return (
                <button
                  key={conv.id}
                  onClick={() => handleConversationClick(conv.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                    isActive ? 'bg-blue-50 hover:bg-blue-50' : ''
                  }`}
                >
                  <Avatar
                    name={otherUser?.name ?? 'Unknown'}
                    avatarUrl={otherUser?.avatarUrl}
                    isOnline={isOnline}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm truncate ${conv.unreadCount ? 'font-bold text-gray-900' : 'font-semibold text-gray-900'}`}>
                        {otherUser?.name ?? 'Unknown'}
                      </span>
                      {lastMessage && (
                        <span className={`text-xs flex-shrink-0 ml-2 ${conv.unreadCount ? 'text-blue-500 font-medium' : 'text-gray-400'}`}>
                          {formatRelativeTime(lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className={`text-xs truncate pr-2 ${conv.unreadCount ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                        {lastMessage ? (
                          lastMessage.type === 'CALL' ? `📞 ${lastMessage.text}` : lastMessage.text ?? ''
                        ) : (
                          ''
                        )}
                      </p>
                      {conv.unreadCount && conv.unreadCount > 0 ? (
                        <span className="flex-shrink-0 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center leading-none">
                          {conv.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* User search modal */}
      <Modal
        isOpen={isSearchOpen}
        onClose={() => {
          setIsSearchOpen(false);
          setSearchQuery('');
          setSearchResults([]);
        }}
        title="New Conversation"
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
    </>
  );
}
