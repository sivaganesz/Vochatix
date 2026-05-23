'use client';

import { Phone, Video, ArrowLeft } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useChatStore } from '@/store/chat.store';
import { useAuthStore } from '@/store/auth.store';
import { useCalls } from '@/hooks/useCalls';
import { Conversation } from '@/types/chat.types';
import { formatLastSeen } from '@/lib/date';
import { useRouter } from 'next/navigation';

interface ChatHeaderProps {
  conversation: Conversation;
  activeTab: 'chat' | 'shared';
  onTabChange: (tab: 'chat' | 'shared') => void;
  onAddMembers?: () => void;
  onEditGroup?: () => void;
}

export function ChatHeader({ 
  conversation, 
  activeTab, 
  onTabChange,
  onAddMembers,
  onEditGroup
}: ChatHeaderProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { onlineUserIds, setSelectedProfileUserId } = useChatStore();
  const { initiateCall } = useCalls();

  const otherUser = conversation.type === 'DIRECT' 
    ? conversation.members.find((m) => m.userId !== user?.id)?.user 
    : undefined;
    
  const isOnline = otherUser ? onlineUserIds.has(otherUser.id) : false;
  
  const title = conversation.type === 'GROUP' 
    ? conversation.name || 'Group Chat' 
    : otherUser?.name ?? 'Unknown';
    
  const subtitle = conversation.type === 'GROUP'
    ? `${conversation.members.length} members`
    : isOnline 
      ? <span className="text-green-600">Online</span>
      : formatLastSeen(otherUser?.lastSeenAt ?? null);

  const handleCall = (type: 'AUDIO' | 'VIDEO') => {
    if (!user) return;
    const targetUserIds = conversation.members
      .filter((m) => m.userId !== user.id)
      .map((m) => m.userId);
    initiateCall(conversation.id, type, targetUserIds);
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Back button for mobile */}
          <button
            onClick={() => router.push('/chat')}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <button 
            onClick={() => otherUser && setSelectedProfileUserId(otherUser.id)}
            className={`flex items-center gap-3 text-left transition-opacity ${otherUser ? 'hover:opacity-80' : 'cursor-default'}`}
            disabled={!otherUser}
          >
            <Avatar
              name={title}
              avatarUrl={conversation.type === 'GROUP' ? conversation.avatarUrl : otherUser?.avatarUrl}
              size="md"
              isOnline={conversation.type === 'DIRECT' ? isOnline : false}
            />

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900">{title}</p>
                {conversation.type === 'GROUP' && onEditGroup && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onEditGroup(); }}
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline px-1"
                  >
                    Edit
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {subtitle}
              </p>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {conversation.type === 'GROUP' && onAddMembers && (
            <button
              onClick={onAddMembers}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors hidden sm:block"
            >
              Add People
            </button>
          )}
          <button
            onClick={() => handleCall('AUDIO')}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
            title="Audio call"
          >
            <Phone className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleCall('VIDEO')}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
            title="Video call"
          >
            <Video className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="px-4 flex items-center gap-6 mt-1">
        <button
          onClick={() => onTabChange('chat')}
          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'chat' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => onTabChange('shared')}
          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'shared' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Shared
        </button>
      </div>
    </div>
  );
}
