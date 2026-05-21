'use client';

import { useCallback } from 'react';
import { getSocket } from '@/lib/socket';
import { useCallStore } from '@/store/call.store';
import { SOCKET_EVENTS } from '@/types/socket.types';
import { Call } from '@/types/call.types';
import api from '@/lib/api';

export function useCalls() {
  const { activeCall, incomingCall, setActiveCall, setIncomingCall, clearCall } = useCallStore();

  const initiateCall = useCallback(
    (conversationId: string, callType: 'AUDIO' | 'VIDEO', targetUserIds: string[]) => {
      const socket = getSocket();
      if (socket) {
        socket.emit(SOCKET_EVENTS.CALL_INVITE, { conversationId, callType, targetUserIds });
      }
    },
    []
  );

  const acceptCall = useCallback(
    (callId: string) => {
      const socket = getSocket();
      if (socket) {
        socket.emit(SOCKET_EVENTS.CALL_ACCEPT, { callId });
      }
      setIncomingCall(null);
    },
    [setIncomingCall]
  );

  const rejectCall = useCallback(
    (callId: string) => {
      const socket = getSocket();
      if (socket) {
        socket.emit(SOCKET_EVENTS.CALL_REJECT, { callId });
      }
      setIncomingCall(null);
    },
    [setIncomingCall]
  );

  const endCall = useCallback(
    (callId: string) => {
      const socket = getSocket();
      if (socket) {
        socket.emit(SOCKET_EVENTS.CALL_END, { callId });
      }
      clearCall();
    },
    [clearCall]
  );

  const fetchCall = useCallback(async (callId: string): Promise<Call> => {
    const response = await api.get(`/api/calls/${callId}`);
    return response.data.data.call as Call;
  }, []);

  return {
    activeCall,
    incomingCall,
    setActiveCall,
    setIncomingCall,
    clearCall,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    fetchCall,
  };
}
