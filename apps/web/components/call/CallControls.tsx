'use client';

import { useLocalParticipant } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, UserPlus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useCallback } from 'react';

interface CallControlsProps {
  onEndCall: () => void;
  showVideo?: boolean;
  onInviteClick?: () => void;
}

export function CallControls({ onEndCall, showVideo = true, onInviteClick }: CallControlsProps) {
  const {
    localParticipant,
    isMicrophoneEnabled,
    isCameraEnabled,
    isScreenShareEnabled,
  } = useLocalParticipant();

  const toggleMic = useCallback(async () => {
    await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
  }, [localParticipant, isMicrophoneEnabled]);

  const toggleCamera = useCallback(async () => {
    await localParticipant.setCameraEnabled(!isCameraEnabled);
  }, [localParticipant, isCameraEnabled]);

  const toggleScreenShare = useCallback(async () => {
    await localParticipant.setScreenShareEnabled(!isScreenShareEnabled);
  }, [localParticipant, isScreenShareEnabled]);

  return (
    <div className="flex items-center justify-center gap-4 p-4 bg-gray-900/80 backdrop-blur-sm rounded-2xl">
      {/* Mute/Unmute */}
      <button
        onClick={toggleMic}
        className={cn(
          'h-12 w-12 rounded-full flex items-center justify-center transition-colors',
          isMicrophoneEnabled
            ? 'bg-gray-700 hover:bg-gray-600'
            : 'bg-red-600 hover:bg-red-700'
        )}
        title={isMicrophoneEnabled ? 'Mute' : 'Unmute'}
      >
        {isMicrophoneEnabled ? (
          <Mic className="h-5 w-5 text-white" />
        ) : (
          <MicOff className="h-5 w-5 text-white" />
        )}
      </button>

      {/* Camera on/off */}
      {showVideo && (
        <button
          onClick={toggleCamera}
          className={cn(
            'h-12 w-12 rounded-full flex items-center justify-center transition-colors',
            isCameraEnabled
              ? 'bg-gray-700 hover:bg-gray-600'
              : 'bg-red-600 hover:bg-red-700'
          )}
          title={isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {isCameraEnabled ? (
            <Video className="h-5 w-5 text-white" />
          ) : (
            <VideoOff className="h-5 w-5 text-white" />
          )}
        </button>
      )}

      {/* Screen share */}
      <button
        onClick={toggleScreenShare}
        className={cn(
          'h-12 w-12 rounded-full flex items-center justify-center transition-colors',
          isScreenShareEnabled
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-gray-700 hover:bg-gray-600'
        )}
        title={isScreenShareEnabled ? 'Stop sharing' : 'Share screen'}
      >
        <MonitorUp className="h-5 w-5 text-white" />
      </button>

      {/* Add People */}
      {onInviteClick && (
        <button
          onClick={onInviteClick}
          className="h-12 w-12 rounded-full flex items-center justify-center transition-colors bg-gray-700 hover:bg-gray-600"
          title="Add people"
        >
          <UserPlus className="h-5 w-5 text-white" />
        </button>
      )}

      {/* End call */}
      <button
        onClick={onEndCall}
        className="h-12 w-12 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
        title="End call"
      >
        <PhoneOff className="h-5 w-5" />
      </button>
    </div>
  );
}
