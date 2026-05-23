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
  source?: Track.Source;
}

export function LocalParticipantTile({ className, source = Track.Source.Camera }: LocalParticipantTileProps) {
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled } = useLocalParticipant();
  const { user } = useAuthStore();

  const trackPub = localParticipant.getTrackPublication(source);
  const isEnabled = source === Track.Source.ScreenShare ? isScreenShareEnabled : isCameraEnabled;

  return (
    <div
      className={cn(
        'relative bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center',
        className
      )}
    >
      {isEnabled && trackPub?.videoTrack ? (
        <VideoTrack
          trackRef={{
            participant: localParticipant,
            publication: trackPub,
            source,
          }}
          className={cn("w-full h-full", source === Track.Source.ScreenShare ? "object-contain scale-x-100" : "object-cover scale-x-[-1]")}
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
