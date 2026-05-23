'use client';

import {
  VideoTrack,
  useParticipantTile,
  ParticipantContextIfNeeded,
} from '@livekit/components-react';
import { Participant, Track } from 'livekit-client';
import { Avatar } from '@/components/ui/Avatar';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { cn } from '@/lib/cn';

interface RemoteParticipantTileProps {
  participant: Participant;
  className?: string;
  source?: Track.Source;
}

export function RemoteParticipantTile({ participant, className, source }: RemoteParticipantTileProps) {
  const videoTrack = participant.getTrackPublication(Track.Source.Camera)?.videoTrack;
  const screenTrack = participant.getTrackPublication(Track.Source.ScreenShare)?.videoTrack;
  const isMuted = participant.getTrackPublication(Track.Source.Microphone)?.isMuted ?? true;

  const activeTrack = source 
    ? participant.getTrackPublication(source)?.videoTrack
    : (screenTrack ?? videoTrack);
  const activeSource = source || (screenTrack ? Track.Source.ScreenShare : Track.Source.Camera);

  return (
    <div
      className={cn(
        'relative bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center',
        className
      )}
    >
      {activeTrack ? (
        <VideoTrack
          trackRef={{ participant, publication: participant.getTrackPublication(activeSource)!, source: activeSource }}
          className={cn("w-full h-full object-cover", activeSource === Track.Source.ScreenShare && "object-contain")}
        />
      ) : (
        <div className="flex flex-col items-center gap-3">
          <Avatar
            name={participant.name ?? participant.identity}
            size="xl"
          />
          <p className="text-white text-sm font-medium">
            {participant.name ?? participant.identity}
          </p>
        </div>
      )}

      {/* Participant info bar */}
      <div className="absolute bottom-2 left-2 flex items-center gap-2">
        <div className="bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1.5">
          {isMuted ? (
            <MicOff className="h-3 w-3 text-red-400" />
          ) : (
            <Mic className="h-3 w-3 text-green-400" />
          )}
          <span className="text-white text-xs font-medium">
            {participant.name ?? participant.identity}
          </span>
        </div>
      </div>

      {/* Screen share indicator */}
      {screenTrack && (
        <div className="absolute top-2 right-2 bg-blue-600/80 backdrop-blur-sm rounded-full px-2 py-1">
          <span className="text-white text-xs">Sharing screen</span>
        </div>
      )}
    </div>
  );
}
