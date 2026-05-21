'use client';

import { useEffect, useCallback } from 'react';
import { useChatStore } from '@/store/chat.store';
import api from '@/lib/api';
import { Conversation } from '@/types/chat.types';

export function useConversations() {
  const { conversations, setConversations, addConversation } = useChatStore();

  const fetchConversations = useCallback(async () => {
    const response = await api.get('/api/conversations');
    setConversations(response.data.data.conversations as Conversation[]);
  }, [setConversations]);

  const createDirectConversation = useCallback(
    async (targetUserId: string): Promise<Conversation> => {
      const response = await api.post('/api/conversations/direct', { targetUserId });
      const conversation = response.data.data.conversation as Conversation;
      addConversation(conversation);
      return conversation;
    },
    [addConversation]
  );

  useEffect(() => {
    fetchConversations().catch(console.error);
  }, [fetchConversations]);

  return { conversations, fetchConversations, createDirectConversation };
}
