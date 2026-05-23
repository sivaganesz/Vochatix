'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
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

    // call:accepted → callee accepted — navigate ONLY if we are caller or we accepted
    socket.on(SOCKET_EVENTS.CALL_ACCEPTED, ({ call }: { call: Call }) => {
      const currentUserId = useAuthStore.getState().user?.id;
      const me = call.participants.find((p) => p.userId === currentUserId);
      const isCaller = call.startedById === currentUserId;
      const didWeAccept = me && me.status === 'ACCEPTED';

      setActiveCall(call);

      if (isCaller || didWeAccept) {
        setIncomingCall(null);
        router.push(`/call/${call.id}`);
      } else if (me && me.status === 'REJECTED') {
        // We rejected earlier, clear the incoming call screen (just in case)
        setIncomingCall(null);
      }
    });

    socket.on(SOCKET_EVENTS.CALL_PARTICIPANT_INCOMING, (payload: IncomingCallState) => {
      setIncomingCall(payload);
    });

    socket.on(SOCKET_EVENTS.CALL_REJECTED, ({ call }: { call: Call }) => {
      const currentUserId = useAuthStore.getState().user?.id;
      const me = call.participants.find((p) => p.userId === currentUserId);
      
      if (call.status === 'REJECTED') {
        // The entire call is rejected (no one left to answer)
        setActiveCall(null);
        setIncomingCall(null);
        clearCall();
      } else {
        // The call continues (still RINGING for others, or ACCEPTED)
        setActiveCall(call);
        // If we were the one being invited and we rejected, clear our incoming call
        if (me && me.status === 'REJECTED') {
          setIncomingCall(null);
        }
      }
    });

    socket.on(SOCKET_EVENTS.CALL_ENDED, ({ call }: { call: Call }) => {
      setActiveCall(null);
      setIncomingCall(null);
      clearCall();
    });

    socket.on(SOCKET_EVENTS.CALL_PARTICIPANT_LEFT, ({ call, leftUserId }: { call: Call, leftUserId: string }) => {
      setActiveCall(call);
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
      s.off(SOCKET_EVENTS.CALL_PARTICIPANT_INCOMING);
      s.off(SOCKET_EVENTS.CALL_ACCEPTED);
      s.off(SOCKET_EVENTS.CALL_REJECTED);
      s.off(SOCKET_EVENTS.CALL_ENDED);
      s.off(SOCKET_EVENTS.CALL_PARTICIPANT_LEFT);
      s.off(SOCKET_EVENTS.CALL_MISSED);
      s.off('conversation:updated');
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

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    
    const handleConversationUpdated = async (conversation: Conversation | { id: string }) => {
      const { updateConversation, conversations, activeConversationId, setActiveConversation } = useChatStore.getState();
      const currentUserId = useAuthStore.getState().user?.id;
      
      if (!currentUserId) return;

      if ('type' in conversation) {
        // Full conversation object (e.g. from renaming or adding members)
        const exists = conversations.some(c => c.id === conversation.id);
        if (exists) {
          updateConversation(conversation);
        } else {
          // If we were just added to it
          useChatStore.getState().addConversation(conversation);
        }
      } else {
        // We left the conversation, or it was deleted
        const api = (await import('@/lib/api')).default;
        try {
          const res = await api.get('/api/conversations');
          useChatStore.getState().setConversations(res.data.data.conversations);
          
          if (activeConversationId === conversation.id) {
            setActiveConversation(null);
            router.push('/chat');
          }
        } catch (e) {
          console.error(e);
        }
      }
    };

    socket.on('conversation:updated', handleConversationUpdated);
    
    return () => {
      socket.off('conversation:updated', handleConversationUpdated);
    }
  }, [router]);

  return <>{children}</>;
}
