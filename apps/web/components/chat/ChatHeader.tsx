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
}

export function ChatHeader({ conversation }: ChatHeaderProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { onlineUserIds } = useChatStore();
  const { initiateCall } = useCalls();

  const otherUser = conversation.members.find((m) => m.userId !== user?.id)?.user;
  const isOnline = otherUser ? onlineUserIds.has(otherUser.id) : false;

  const handleCall = (type: 'AUDIO' | 'VIDEO') => {
    if (!otherUser || !user) return;
    // Emit call:invite via socket — server will create the call and send back
    // call:incoming to both parties (isCaller=true for us, isCaller=false for them).
    // SocketProvider listens for call:incoming and sets activeCall in the store.
    // The CallingScreen overlay in AppShell shows while we wait for the other user.
    initiateCall(conversation.id, type, [otherUser.id]);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      <div className="flex items-center gap-3">
        {/* Back button for mobile */}
        <button
          onClick={() => router.push('/chat')}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <Avatar
          name={otherUser?.name ?? 'Unknown'}
          avatarUrl={otherUser?.avatarUrl}
          size="md"
          isOnline={isOnline}
        />

        <div>
          <p className="text-sm font-semibold text-gray-900">{otherUser?.name ?? 'Unknown'}</p>
          <p className="text-xs text-gray-500">
            {isOnline ? (
              <span className="text-green-600">Online</span>
            ) : (
              formatLastSeen(otherUser?.lastSeenAt ?? null)
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleCall('AUDIO')}
          className="p-2.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
          title="Audio call"
        >
          <Phone className="h-5 w-5" />
        </button>
        <button
          onClick={() => handleCall('VIDEO')}
          className="p-2.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
          title="Video call"
        >
          <Video className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
