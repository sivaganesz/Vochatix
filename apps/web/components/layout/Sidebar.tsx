'use client';

import { ConversationList } from '@/components/chat/ConversationList';

export function Sidebar() {
  return (
    <aside className="w-80 flex-shrink-0 flex flex-col bg-white border-r border-gray-200 h-full">
      <ConversationList />
    </aside>
  );
}
