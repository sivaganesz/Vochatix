'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { Spinner } from '@/components/ui/Spinner';
import { useMessages } from '@/hooks/useMessages';
import { useChatStore } from '@/store/chat.store';
import { Conversation } from '@/types/chat.types';
import api from '@/lib/api';

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>;
}

export default function ConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = use(params);
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { typingUsers } = useChatStore();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoadingConv, setIsLoadingConv] = useState(true);

  const { messages, sendMessage, startTyping, stopTyping } = useMessages(conversationId);

  // Get typing users in this conversation (exclude self)
  const typingInThisConversation = typingUsers.filter(
    (t) => t.conversationId === conversationId && t.userId !== user?.id
  );

  // Get display names for typing users
  const typingUserNames = typingInThisConversation.map((t) => {
    const member = conversation?.members.find((m) => m.userId === t.userId);
    return member?.user.name ?? 'Someone';
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
      return;
    }

    const fetchConversation = async () => {
      try {
        const response = await api.get(`/api/conversations/${conversationId}`);
        setConversation(response.data.data.conversation as Conversation);
      } catch {
        router.push('/chat');
      } finally {
        setIsLoadingConv(false);
      }
    };

    if (isAuthenticated) {
      fetchConversation();
    }
  }, [conversationId, isAuthenticated, authLoading, router]);

  if (authLoading || isLoadingConv) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  if (!conversation || !user) return null;

  return (
    <ChatLayout>
      <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
        <ChatHeader conversation={conversation} />

        <MessageList
          messages={messages}
          currentUserId={user.id}
        />

        <TypingIndicator typingUserNames={typingUserNames} />

        <MessageInput
          onSend={sendMessage}
          onTypingStart={startTyping}
          onTypingStop={stopTyping}
        />
      </div>
    </ChatLayout>
  );
}
