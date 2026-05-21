'use client';

import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useChatStore } from '@/store/chat.store';
import { useCallStore } from '@/store/call.store';
import { connectSocket, getSocket } from '@/lib/socket';
import { SOCKET_EVENTS } from '@/types/socket.types';
import { Message, Conversation } from '@/types/chat.types';
import { Call, IncomingCallState } from '@/types/call.types';

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { isAuthenticated } = useAuthStore();
  const { addMessage, addConversation, setUserOnline, setUserOffline, addTypingUser, removeTypingUser } =
    useChatStore();
  const { setIncomingCall, setActiveCall, clearCall } = useCallStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = connectSocket();

    // Presence events
    socket.on(SOCKET_EVENTS.USER_ONLINE, ({ userId }: { userId: string }) => {
      setUserOnline(userId);
    });

    socket.on(SOCKET_EVENTS.USER_OFFLINE, ({ userId }: { userId: string }) => {
      setUserOffline(userId);
    });

    // Message events (global listener for all conversations)
    socket.on(SOCKET_EVENTS.MESSAGE_NEW, ({ message }: { message: Message }) => {
      addMessage(message);
    });

    // Call events
    socket.on(SOCKET_EVENTS.CALL_INCOMING, (payload: IncomingCallState) => {
      setIncomingCall(payload);
      if (payload.isCaller) {
        setActiveCall(payload.call);
      }
    });

    socket.on(SOCKET_EVENTS.CALL_ACCEPTED, ({ call }: { call: Call }) => {
      setActiveCall(call);
      setIncomingCall(null);
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
      s.off(SOCKET_EVENTS.CALL_INCOMING);
      s.off(SOCKET_EVENTS.CALL_ACCEPTED);
      s.off(SOCKET_EVENTS.CALL_REJECTED);
      s.off(SOCKET_EVENTS.CALL_ENDED);
      s.off(SOCKET_EVENTS.CALL_MISSED);
    };
  }, [
    isAuthenticated,
    addMessage,
    addConversation,
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
