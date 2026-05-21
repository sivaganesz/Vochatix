'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  useConnectionState,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { ConnectionState } from 'livekit-client';
import { Spinner } from '@/components/ui/Spinner';
import { useLiveKitToken } from '@/hooks/useLiveKitToken';
import { useCalls } from '@/hooks/useCalls';
import { Call } from '@/types/call.types';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { cn } from '@/lib/cn';

interface CallScreenProps {
  call: Call;
}

function CallConnectionStatus() {
  const connectionState = useConnectionState();

  if (connectionState === ConnectionState.Connected) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
      <div className="bg-black/70 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2">
        <Spinner size="sm" className="text-white" />
        {connectionState === ConnectionState.Connecting ? 'Connecting...' : 'Reconnecting...'}
      </div>
    </div>
  );
}

export function CallScreen({ call }: CallScreenProps) {
  const router = useRouter();
  const { fetchToken, tokenData, isLoading, error } = useLiveKitToken();
  const { endCall } = useCalls();

  useEffect(() => {
    fetchToken(call.id).catch(console.error);
  }, [call.id, fetchToken]);

  const handleEndCall = () => {
    endCall(call.id);
    router.push(`/chat/${call.conversationId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-4">
        <Spinner size="lg" className="text-white" />
        <p className="text-white text-lg">Setting up call...</p>
      </div>
    );
  }

  if (error || !tokenData) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-lg">Failed to connect to call</p>
        <button
          onClick={() => router.push(`/chat/${call.conversationId}`)}
          className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100"
        >
          Back to chat
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <LiveKitRoom
        token={tokenData.token}
        serverUrl={tokenData.url}
        connect={true}
        video={call.callType === 'VIDEO'}
        audio={true}
        onDisconnected={() => {
          router.push(`/chat/${call.conversationId}`);
        }}
        style={{ height: '100dvh' }}
      >
        <div className="relative h-full">
          <CallConnectionStatus />

          {/* Call header */}
          <div className="absolute top-0 left-0 right-0 z-10 px-4 py-3 bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                {call.callType === 'VIDEO' ? (
                  <Video className="h-4 w-4" />
                ) : (
                  <Phone className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {call.callType === 'VIDEO' ? 'Video Call' : 'Audio Call'}
                </span>
              </div>
              <div className="text-white text-sm">
                {call.participants.map((p) => p.user.name).join(', ')}
              </div>
            </div>
          </div>

          {/* LiveKit VideoConference handles mic/camera/screenshare controls */}
          <VideoConference />

          {/* End call overlay button */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
            <button
              onClick={handleEndCall}
              className="h-14 w-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
              title="End call"
            >
              <PhoneOff className="h-6 w-6" />
            </button>
          </div>
        </div>
      </LiveKitRoom>
    </div>
  );
}
