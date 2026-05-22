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

  let gridClass = 'grid-cols-1';
  if (totalParticipants === 2) gridClass = 'grid-cols-1 sm:grid-cols-2';
  else if (totalParticipants <= 4) gridClass = 'grid-cols-2';
  else if (totalParticipants <= 6) gridClass = 'grid-cols-2 sm:grid-cols-3';
  else if (totalParticipants <= 9) gridClass = 'grid-cols-3';
  else gridClass = 'grid-cols-3 sm:grid-cols-4';

  return (
    <div className={cn('flex-1 min-h-0 overflow-y-auto flex items-center justify-center p-4 sm:p-8', className)}>
      <div className={cn('w-full max-w-5xl grid gap-4 sm:gap-6', gridClass)}>
        {/* Remote participants first */}
        {remoteParticipants.map((participant) => (
          <RemoteParticipantTile
            key={participant.identity}
            participant={participant}
            className="aspect-square w-full shadow-xl border border-gray-700/50 rounded-xl"
          />
        ))}

        {/* Local participant (self-view) */}
        {showVideo && (
          <LocalParticipantTile className="aspect-square w-full shadow-xl border border-gray-700/50 rounded-xl" />
        )}
      </div>
    </div>
  );
}
