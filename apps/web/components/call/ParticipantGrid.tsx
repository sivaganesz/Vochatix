'use client';

import { useRemoteParticipants } from '@livekit/components-react';
import { RemoteParticipantTile } from './RemoteParticipantTile';
import { LocalParticipantTile } from './LocalParticipantTile';
import { cn } from '@/lib/cn';

interface ParticipantGridProps {
  showVideo: boolean;
  className?: string;
}

export function ParticipantGrid({ showVideo, className }: ParticipantGridProps) {
  const remoteParticipants = useRemoteParticipants();
  const totalParticipants = remoteParticipants.length + 1; // +1 for local

  const gridClass =
    totalParticipants === 1
      ? 'grid-cols-1'
      : totalParticipants === 2
        ? 'grid-cols-2'
        : totalParticipants <= 4
          ? 'grid-cols-2'
          : 'grid-cols-3';

  return (
    <div className={cn('flex-1 grid gap-2 p-2', gridClass, className)}>
      {/* Remote participants first */}
      {remoteParticipants.map((participant) => (
        <RemoteParticipantTile
          key={participant.identity}
          participant={participant}
          className="min-h-48"
        />
      ))}

      {/* Local participant (self-view) */}
      {showVideo && (
        <LocalParticipantTile className="min-h-48" />
      )}
    </div>
  );
}
