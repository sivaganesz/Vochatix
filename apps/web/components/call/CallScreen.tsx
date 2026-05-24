'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import '@livekit/components-styles';
import { Spinner } from '@/components/ui/Spinner';
import { useLiveKitToken } from '@/hooks/useLiveKitToken';
import { useCalls } from '@/hooks/useCalls';
import { Call } from '@/types/call.types';
import { Phone, Video } from 'lucide-react';
import { CallControls } from './CallControls';
import { CallStatusBanner } from './CallStatusBanner';
import { ParticipantGrid } from './ParticipantGrid';
import { CallDurationTimer } from './CallDurationTimer';
import { InvitePeopleModal } from './InvitePeopleModal';
import { getSocket } from '@/lib/socket';
import { SOCKET_EVENTS } from '@/types/socket.types';

interface CallScreenProps {
  call: Call;
}

function CallRoomContent({
  call,
  onEndCall,
}: {
  call: Call;
  onEndCall: () => void;
}) {
  const isVideo = call.callType === 'VIDEO';
  const { inviteToCall } = useCalls();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const existingParticipantIds = call.participants?.map((p) => p.userId) || [];

  const handleInvite = (userIds: string[]) => {
    inviteToCall(call.id, userIds);
  };

  return (
    <div className="relative flex flex-col h-full overflow-hidden bg-gray-900">
      {/* Connection status banner */}
      <CallStatusBanner />

      {/* Call header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent z-10 flex-shrink-0">
        <div className="flex items-center gap-2 text-white">
          {isVideo ? (
            <Video className="h-4 w-4" />
          ) : (
            <Phone className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">
            {isVideo ? 'Video Call' : 'Audio Call'}
          </span>
        </div>
        <CallDurationTimer startedAt={call.startedAt} />
      </div>

      {/* Participant grid */}
      <ParticipantGrid showVideo={isVideo} className="flex-1" />

      {/* Audio rendering (always needed) */}
      <RoomAudioRenderer />

      {/* Call controls */}
      <div className="flex-shrink-0 py-6 flex justify-center bg-gradient-to-t from-black/60 to-transparent">
        <CallControls 
          onEndCall={onEndCall} 
          showVideo={isVideo} 
          onInviteClick={() => setIsInviteModalOpen(true)}
        />
      </div>

      {/* Invite Modal */}
      <InvitePeopleModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInvite}
        existingParticipantIds={existingParticipantIds}
      />
    </div>
  );
}

export function CallScreen({ call }: CallScreenProps) {
  const router = useRouter();
  const { fetchToken, tokenData, isLoading, error } = useLiveKitToken();
  const { endCall } = useCalls();
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [currentCall, setCurrentCall] = useState<Call>(call);

  useEffect(() => {
    fetchToken(call.id).catch((err) => {
      console.error('Failed to fetch LiveKit token:', err);
    });
  }, [call.id, fetchToken]);

  // Listen for CALL_ENDED — navigate away for everyone when call terminates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleCallEnded = ({ call: updatedCall }: { call: Call }) => {
      if (updatedCall.id === call.id) {
        router.push(`/chat/${updatedCall.conversationId}`);
      }
    };

    // Update participant list when someone leaves but call continues
    const handleParticipantLeft = ({ call: updatedCall }: { call: Call; leftUserId: string }) => {
      if (updatedCall.id === call.id) {
        setCurrentCall(updatedCall);
      }
    };

    socket.on(SOCKET_EVENTS.CALL_ENDED, handleCallEnded);
    socket.on(SOCKET_EVENTS.CALL_PARTICIPANT_LEFT, handleParticipantLeft);
    return () => {
      socket.off(SOCKET_EVENTS.CALL_ENDED, handleCallEnded);
      socket.off(SOCKET_EVENTS.CALL_PARTICIPANT_LEFT, handleParticipantLeft);
    };
  }, [call.id, router]);

  // Only emit the leave/end event — do NOT navigate here.
  // Navigation is handled by the CALL_ENDED socket event above.
  // This way, in a group call with ≥3 participants, the leaving user
  // navigates away (server sends them CALL_ENDED) while others stay.
  const handleEndCall = useCallback(() => {
    endCall(call.id);
  }, [call.id, endCall]);

  const handleError = useCallback((err: Error) => {
    if (err.name === 'NotAllowedError' || err.message.includes('Permission')) {
      setPermissionError(
        'Camera or microphone access was denied. Please allow access and rejoin the call.'
      );
    } else {
      console.error('LiveKit error:', err);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-4">
        <Spinner size="lg" className="text-white" />
        <p className="text-white text-lg">Connecting to call...</p>
      </div>
    );
  }

  if (error || !tokenData) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-4">
        <Phone className="h-12 w-12 text-red-400" />
        <p className="text-red-400 text-lg">Failed to connect to call</p>
        <button
          onClick={() => router.push(`/chat/${call.conversationId}`)}
          className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Back to chat
        </button>
      </div>
    );
  }

  if (permissionError) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-4 px-6">
        <div className="text-center">
          <p className="text-yellow-400 text-lg font-semibold mb-2">Permission Required</p>
          <p className="text-gray-400 text-sm max-w-sm">{permissionError}</p>
        </div>
        <button
          onClick={() => router.push(`/chat/${call.conversationId}`)}
          className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Back to chat
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-900">
      <LiveKitRoom
        token={tokenData.token}
        serverUrl={tokenData.url}
        connect={true}
        video={call.callType === 'VIDEO'}
        audio={true}
        onDisconnected={() => {
          router.push(`/chat/${call.conversationId}`);
        }}
        onError={handleError}
        style={{ height: '100dvh' }}
      >
        <CallRoomContent call={currentCall} onEndCall={handleEndCall} />
      </LiveKitRoom>
    </div>
  );
}
