'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useChatStore } from '@/store/chat.store';
import api from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { Message } from '@/types/chat.types';
import { SOCKET_EVENTS } from '@/types/socket.types';

export function useMessages(conversationId: string) {
  const { messages, setMessages, addMessage, addTypingUser, removeTypingUser } = useChatStore();
  const typingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const conversationMessages = messages[conversationId] ?? [];

  const fetchMessages = useCallback(async () => {
    const response = await api.get(`/api/conversations/${conversationId}/messages`);
    setMessages(conversationId, response.data.data.messages as Message[]);
  }, [conversationId, setMessages]);

  const sendMessage = useCallback(
    (text: string) => {
      const socket = getSocket();
      if (socket) {
        socket.emit(SOCKET_EVENTS.MESSAGE_SEND, { conversationId, text });
      }
    },
    [conversationId]
  );

  const startTyping = useCallback(() => {
    const socket = getSocket();
    if (socket) {
      socket.emit(SOCKET_EVENTS.TYPING_START, { conversationId });
    }
  }, [conversationId]);

  const stopTyping = useCallback(() => {
    const socket = getSocket();
    if (socket) {
      socket.emit(SOCKET_EVENTS.TYPING_STOP, { conversationId });
    }
  }, [conversationId]);

  // Fetch messages on mount and join conversation socket room
  useEffect(() => {
    fetchMessages().catch(console.error);

    const socket = getSocket();
    if (socket) {
      socket.emit('conversation:join', { conversationId });
    }
  }, [conversationId, fetchMessages]);

  // Listen for new messages
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = ({ message }: { message: Message }) => {
      if (message.conversationId === conversationId) {
        addMessage(message);
      }
    };

    const handleTypingStart = ({
      userId,
      conversationId: cid,
    }: {
      userId: string;
      conversationId: string;
    }) => {
      if (cid !== conversationId) return;
      addTypingUser(userId, conversationId);

      // Auto-clear after 3 seconds
      const existing = typingTimeoutsRef.current.get(userId);
      if (existing) clearTimeout(existing);
      const timeout = setTimeout(() => {
        removeTypingUser(userId, conversationId);
      }, 3000);
      typingTimeoutsRef.current.set(userId, timeout);
    };

    const handleTypingStop = ({
      userId,
      conversationId: cid,
    }: {
      userId: string;
      conversationId: string;
    }) => {
      if (cid !== conversationId) return;
      const existing = typingTimeoutsRef.current.get(userId);
      if (existing) clearTimeout(existing);
      removeTypingUser(userId, conversationId);
    };

    socket.on(SOCKET_EVENTS.MESSAGE_NEW, handleNewMessage);
    socket.on(SOCKET_EVENTS.TYPING_START, handleTypingStart);
    socket.on(SOCKET_EVENTS.TYPING_STOP, handleTypingStop);

    return () => {
      socket.off(SOCKET_EVENTS.MESSAGE_NEW, handleNewMessage);
      socket.off(SOCKET_EVENTS.TYPING_START, handleTypingStart);
      socket.off(SOCKET_EVENTS.TYPING_STOP, handleTypingStop);
    };
  }, [conversationId, addMessage, addTypingUser, removeTypingUser]);

  return {
    messages: conversationMessages,
    fetchMessages,
    sendMessage,
    startTyping,
    stopTyping,
  };
}
