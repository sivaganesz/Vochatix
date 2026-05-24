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
      
      // Join the socket room for the new conversation
      const socket = (await import('@/lib/socket')).getSocket();
      if (socket) {
        socket.emit('conversation:join', { conversationId: conversation.id });
      }
      
      return conversation;
    },
    [addConversation]
  );

  const createGroupConversation = useCallback(
    async (targetUserIds: string[], name?: string, avatarUrl?: string): Promise<Conversation> => {
      const response = await api.post('/api/conversations/group', { targetUserIds, name, avatarUrl });
      const conversation = response.data.data.conversation as Conversation;
      addConversation(conversation);
      
      // Join the socket room for the new conversation
      const socket = (await import('@/lib/socket')).getSocket();
      if (socket) {
        socket.emit('conversation:join', { conversationId: conversation.id });
      }
      
      return conversation;
    },
    [addConversation]
  );

  const updateGroupName = useCallback(
    async (conversationId: string, name: string): Promise<Conversation> => {
      const response = await api.patch(`/api/conversations/${conversationId}`, { name });
      return response.data.data.conversation as Conversation;
    },
    []
  );

  const addGroupMembers = useCallback(
    async (conversationId: string, targetUserIds: string[]): Promise<Conversation> => {
      const response = await api.post(`/api/conversations/${conversationId}/participants`, { targetUserIds });
      return response.data.data.conversation as Conversation;
    },
    []
  );

  const leaveGroup = useCallback(
    async (conversationId: string): Promise<void> => {
      await api.delete(`/api/conversations/${conversationId}/participants/me`);
    },
    []
  );

  useEffect(() => {
    fetchConversations().catch(console.error);
  }, [fetchConversations]);

  const toggleMuteConversation = useCallback(
    async (conversationId: string): Promise<void> => {
      await api.patch(`/api/conversations/${conversationId}/mute`);
      fetchConversations();
    },
    [fetchConversations]
  );

  const toggleUnreadConversation = useCallback(
    async (conversationId: string): Promise<void> => {
      await api.patch(`/api/conversations/${conversationId}/mark-unread`);
      fetchConversations();
    },
    [fetchConversations]
  );

  const hideConversation = useCallback(
    async (conversationId: string): Promise<void> => {
      await api.patch(`/api/conversations/${conversationId}/remove-from-view`);
      
      const { activeConversationId, setActiveConversation } = useChatStore.getState();
      if (activeConversationId === conversationId) {
        setActiveConversation(null);
      }
      fetchConversations();
    },
    [fetchConversations]
  );

  return { 
    conversations, 
    fetchConversations, 
    createDirectConversation, 
    createGroupConversation,
    updateGroupName,
    addGroupMembers,
    leaveGroup,
    toggleMuteConversation,
    toggleUnreadConversation,
    hideConversation
  };
}
