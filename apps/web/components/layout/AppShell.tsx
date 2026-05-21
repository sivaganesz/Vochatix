'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useCallStore } from '@/store/call.store';
import { useCalls } from '@/hooks/useCalls';
import { IncomingCallModal } from '@/components/call/IncomingCallModal';
import { CallingScreen } from '@/components/call/CallingScreen';
import { useRouter } from 'next/navigation';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const { incomingCall, activeCall } = useCallStore();
  const { acceptCall, rejectCall, endCall } = useCalls();

  const handleAccept = (callId: string) => {
    acceptCall(callId);
    // Navigation is handled by SocketProvider on call:accepted event
  };

  const handleReject = (callId: string) => {
    rejectCall(callId);
  };

  const handleCancelCall = () => {
    if (activeCall) {
      endCall(activeCall.id);
    }
  };

  // Caller: show calling overlay while waiting
  const showCallingScreen = incomingCall?.isCaller && activeCall;

  // Callee: show incoming call modal
  const showIncomingModal = incomingCall && !incomingCall.isCaller;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>

      {/* Caller: "Calling..." overlay */}
      {showCallingScreen && (
        <CallingScreen
          call={activeCall}
          onCancel={handleCancelCall}
        />
      )}

      {/* Callee: incoming call notification */}
      {showIncomingModal && (
        <IncomingCallModal
          call={incomingCall.call}
          onAccept={() => handleAccept(incomingCall.call.id)}
          onReject={() => handleReject(incomingCall.call.id)}
        />
      )}
    </div>
  );
}
