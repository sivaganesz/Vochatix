'use client';

import { ReactNode } from 'react';
import { ConversationList } from './ConversationList';
import { useChatStore } from '@/store/chat.store';
import { UserProfilePanel } from '@/components/profile/UserProfilePanel';

interface ChatLayoutProps {
  children: ReactNode;
}

export function ChatLayout({ children }: ChatLayoutProps) {
  const { selectedProfileUserId, setSelectedProfileUserId } = useChatStore();

  return (
    <div className="flex h-full w-full bg-white">
      {/* Secondary Panel: Chat List */}
      <div className="w-80 flex-shrink-0 flex flex-col bg-white border-r border-gray-200 h-full">
        <ConversationList />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50 h-full">
        {children}
      </div>

      {/* Right User Profile Panel */}
      {selectedProfileUserId && (
        <UserProfilePanel
          userId={selectedProfileUserId}
          onClose={() => setSelectedProfileUserId(null)}
        />
      )}
    </div>
  );
}
