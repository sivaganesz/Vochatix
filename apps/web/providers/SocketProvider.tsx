'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useChatStore } from '@/store/chat.store';
import { useCallStore } from '@/store/call.store';
import { connectSocket, getSocket } from '@/lib/socket';
import { SOCKET_EVENTS } from '@/types/socket.types';
import { Message } from '@/types/chat.types';
import { Call, IncomingCallState } from '@/types/call.types';

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addMessage, setUserOnline, setUserOffline, addTypingUser, removeTypingUser } =
    useChatStore();
  const { setIncomingCall, setActiveCall, clearCall } = useCallStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = connectSocket();

    // Presence
    socket.on(SOCKET_EVENTS.USER_ONLINE, ({ userId }: { userId: string }) => {
      setUserOnline(userId);
    });

    socket.on(SOCKET_EVENTS.USER_OFFLINE, ({ userId }: { userId: string }) => {
      setUserOffline(userId);
    });

    // Messages
    socket.on(SOCKET_EVENTS.MESSAGE_NEW, async ({ message }: { message: Message }) => {
      addMessage(message);
      
      const { 
        activeConversationId, 
        incrementUnreadCount, 
        conversations, 
        updateConversation, 
        addConversation 
      } = useChatStore.getState();
      const currentUserId = useAuthStore.getState().user?.id;
      
      const existingConv = conversations.find((c) => c.id === message.conversationId);
      
      if (existingConv) {
        // Update the conversation's last message and timestamp for the list
        updateConversation({
          ...existingConv,
          messages: [message],
          updatedAt: message.createdAt,
        });
      } else {
        // It's a new conversation from someone else, fetch it and add to list
        try {
          // We need to import api, wait we don't have api imported here. 
          // Let's import api at the top if it's not there, or dynamically import it.
          const api = (await import('@/lib/api')).default;
          const response = await api.get(`/api/conversations/${message.conversationId}`);
          if (response.data?.data?.conversation) {
            addConversation(response.data.data.conversation);
          }
        } catch (err) {
          console.error('Failed to fetch new conversation', err);
        }
      }

      if (
        message.senderId !== currentUserId &&
        message.conversationId !== activeConversationId
      ) {
        incrementUnreadCount(message.conversationId);
      }
    });

    // Typing
    socket.on(
      SOCKET_EVENTS.TYPING_START,
      ({ userId, conversationId }: { userId: string; conversationId: string }) => {
        addTypingUser(userId, conversationId);
      }
    );

    socket.on(
      SOCKET_EVENTS.TYPING_STOP,
      ({ userId, conversationId }: { userId: string; conversationId: string }) => {
        removeTypingUser(userId, conversationId);
      }
    );

    // Calls
    // call:incoming → received by BOTH caller (isCaller=true) and callee (isCaller=false)
    socket.on(SOCKET_EVENTS.CALL_INCOMING, (payload: IncomingCallState) => {
      setIncomingCall(payload);
      if (payload.isCaller) {
        // We are the caller — store active call, show CallingScreen overlay
        setActiveCall(payload.call);
      }
    });

    // call:accepted → callee accepted — BOTH should navigate to the call page
    socket.on(SOCKET_EVENTS.CALL_ACCEPTED, ({ call }: { call: Call }) => {
      setActiveCall(call);
      setIncomingCall(null);
      // Navigate both parties to the call room
      router.push(`/call/${call.id}`);
    });

    socket.on(SOCKET_EVENTS.CALL_REJECTED, ({ call }: { call: Call }) => {
      setActiveCall(null);
      setIncomingCall(null);
      clearCall();
    });

    socket.on(SOCKET_EVENTS.CALL_ENDED, ({ call }: { call: Call }) => {
      setActiveCall(null);
      setIncomingCall(null);
      clearCall();
    });

    socket.on(SOCKET_EVENTS.CALL_MISSED, ({ call }: { call: Call }) => {
      setIncomingCall(null);
      clearCall();
    });

    return () => {
      const s = getSocket();
      if (!s) return;
      s.off(SOCKET_EVENTS.USER_ONLINE);
      s.off(SOCKET_EVENTS.USER_OFFLINE);
      s.off(SOCKET_EVENTS.MESSAGE_NEW);
      s.off(SOCKET_EVENTS.TYPING_START);
      s.off(SOCKET_EVENTS.TYPING_STOP);
      s.off(SOCKET_EVENTS.CALL_INCOMING);
      s.off(SOCKET_EVENTS.CALL_ACCEPTED);
      s.off(SOCKET_EVENTS.CALL_REJECTED);
      s.off(SOCKET_EVENTS.CALL_ENDED);
      s.off(SOCKET_EVENTS.CALL_MISSED);
    };
  }, [
    isAuthenticated,
    router,
    addMessage,
    setUserOnline,
    setUserOffline,
    setIncomingCall,
    setActiveCall,
    clearCall,
    addTypingUser,
    removeTypingUser,
  ]);

  return <>{children}</>;
}
