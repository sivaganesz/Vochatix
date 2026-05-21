'use client';

import { useRef, useEffect } from 'react';
import { Message } from '@/types/chat.types';
import { MessageBubble } from './MessageBubble';
import { Spinner } from '@/components/ui/Spinner';
import { MessageSquare } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isLoading?: boolean;
}

export function MessageList({ messages, currentUserId, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <MessageSquare className="h-16 w-16 text-gray-200 mb-4" />
        <p className="text-gray-500 font-medium">No messages yet</p>
        <p className="text-gray-400 text-sm mt-1">Say hello to start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isSelf={message.senderId === currentUserId}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
