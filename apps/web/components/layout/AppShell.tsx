'use client';

import { ReactNode } from 'react';
import { PrimarySidebar } from './PrimarySidebar';
import { useCallStore } from '@/store/call.store';
import { useCalls } from '@/hooks/useCalls';
import { IncomingCallModal } from '@/components/call/IncomingCallModal';
import { CallingScreen } from '@/components/call/CallingScreen';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const { incomingCall, activeCall } = useCallStore();
  const { user } = useAuthStore();
  const { acceptCall, rejectCall, endCall } = useCalls();

  const handleAcceptCall = (callId: string) => {
    acceptCall(callId);
    router.push(`/call/${callId}`);
  };

  const isOutgoingCall = activeCall && activeCall.status === 'RINGING' && activeCall.startedById === user?.id;

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <PrimarySidebar />
      
      <main className="flex-1 flex min-w-0 h-full overflow-hidden">
        {children}
      </main>

      {/* Outgoing calling screen */}
      {isOutgoingCall && (
        <CallingScreen
          call={activeCall}
          onCancel={() => endCall(activeCall.id)}
        />
      )}

      {/* Incoming call modal */}
      {incomingCall && !incomingCall.isCaller && (
        <IncomingCallModal
          call={incomingCall.call}
          onAccept={() => handleAcceptCall(incomingCall.call.id)}
          onReject={() => rejectCall(incomingCall.call.id)}
        />
      )}
    </div>
  );
}
