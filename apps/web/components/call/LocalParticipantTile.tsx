'use client';

import { useLocalParticipant } from '@livekit/components-react';
import { VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { Avatar } from '@/components/ui/Avatar';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/store/auth.store';

interface LocalParticipantTileProps {
  className?: string;
}

export function LocalParticipantTile({ className }: LocalParticipantTileProps) {
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant();
  const { user } = useAuthStore();

  const cameraTrack = localParticipant.getTrackPublication(Track.Source.Camera);

  return (
    <div
      className={cn(
        'relative bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center',
        className
      )}
    >
      {isCameraEnabled && cameraTrack?.videoTrack ? (
        <VideoTrack
          trackRef={{
            participant: localParticipant,
            publication: cameraTrack,
            source: Track.Source.Camera,
          }}
          className="w-full h-full object-cover scale-x-[-1]"
        />
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Avatar name={user?.name ?? 'You'} avatarUrl={user?.avatarUrl} size="lg" />
          <p className="text-white text-xs">You</p>
        </div>
      )}

      {/* Mute indicator */}
      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1.5">
        {isMicrophoneEnabled ? (
          <Mic className="h-3 w-3 text-green-400" />
        ) : (
          <MicOff className="h-3 w-3 text-red-400" />
        )}
        <span className="text-white text-xs">You</span>
      </div>
    </div>
  );
}
