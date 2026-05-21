'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useCallStore } from '@/store/call.store';
import { useCalls } from '@/hooks/useCalls';
import { IncomingCallModal } from '@/components/call/IncomingCallModal';
import { useRouter } from 'next/navigation';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const { incomingCall } = useCallStore();
  const { acceptCall, rejectCall } = useCalls();

  const handleAccept = (callId: string) => {
    acceptCall(callId);
    router.push(`/call/${callId}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>

      {/* Global incoming call modal — shown over entire app */}
      {incomingCall && !incomingCall.isCaller && (
        <IncomingCallModal
          call={incomingCall.call}
          onAccept={() => handleAccept(incomingCall.call.id)}
          onReject={() => rejectCall(incomingCall.call.id)}
        />
      )}
    </div>
  );
}
