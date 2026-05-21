'use client';

import { ReactNode } from 'react';
import { ConversationList } from './ConversationList';
import { IncomingCallModal } from '@/components/call/IncomingCallModal';
import { CallingScreen } from '@/components/call/CallingScreen';
import { useCallStore } from '@/store/call.store';
import { useAuthStore } from '@/store/auth.store';
import { useCalls } from '@/hooks/useCalls';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/chat.store';
import { UserProfilePanel } from '@/components/profile/UserProfilePanel';

interface ChatLayoutProps {
  children: ReactNode;
}

export function ChatLayout({ children }: ChatLayoutProps) {
  const { incomingCall, activeCall } = useCallStore();
  const { user } = useAuthStore();
  const { selectedProfileUserId, setSelectedProfileUserId } = useChatStore();
  const { acceptCall, rejectCall, endCall } = useCalls();
  const router = useRouter();

  const handleAcceptCall = (callId: string) => {
    acceptCall(callId);
    router.push(`/call/${callId}`);
  };

  const isOutgoingCall = activeCall && activeCall.status === 'RINGING' && activeCall.startedById === user?.id;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 flex flex-col bg-white border-r border-gray-200">
        <ConversationList />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">{children}</div>

      {/* Right User Profile Panel */}
      {selectedProfileUserId && (
        <UserProfilePanel
          userId={selectedProfileUserId}
          onClose={() => setSelectedProfileUserId(null)}
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

      {/* Outgoing calling screen */}
      {isOutgoingCall && (
        <CallingScreen
          call={activeCall}
          onCancel={() => endCall(activeCall.id)}
        />
      )}
    </div>
  );
}
