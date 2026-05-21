'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { CallScreen } from '@/components/call/CallScreen';
import { Spinner } from '@/components/ui/Spinner';
import { useCalls } from '@/hooks/useCalls';
import { Call } from '@/types/call.types';
import { useCallStore } from '@/store/call.store';
import { SOCKET_EVENTS } from '@/types/socket.types';
import { getSocket } from '@/lib/socket';

interface CallPageProps {
  params: Promise<{ callId: string }>;
}

export default function CallPage({ params }: CallPageProps) {
  const { callId } = use(params);
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { fetchCall } = useCalls();
  const { setActiveCall, clearCall } = useCallStore();

  const [call, setCall] = useState<Call | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
      return;
    }

    const loadCall = async () => {
      try {
        const callData = await fetchCall(callId);
        setCall(callData);
        setActiveCall(callData);
      } catch {
        setError('Call not found');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadCall();
    }
  }, [callId, isAuthenticated, authLoading, router, fetchCall, setActiveCall]);

  // Listen for call ended event
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !call) return;

    const handleCallEnded = ({ call: updatedCall }: { call: Call }) => {
      if (updatedCall.id === callId) {
        clearCall();
        router.push(`/chat/${updatedCall.conversationId}`);
      }
    };

    socket.on(SOCKET_EVENTS.CALL_ENDED, handleCallEnded);
    return () => {
      socket.off(SOCKET_EVENTS.CALL_ENDED, handleCallEnded);
    };
  }, [callId, call, clearCall, router]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Spinner size="lg" className="text-white" />
      </div>
    );
  }

  if (error || !call) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-lg">{error ?? 'Call not found'}</p>
        <button
          onClick={() => router.push('/chat')}
          className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100"
        >
          Back to chat
        </button>
      </div>
    );
  }

  return <CallScreen call={call} />;
}
