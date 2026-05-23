'use client';

import { useState } from 'react';
import { useRemoteParticipants, useLocalParticipant } from '@livekit/components-react';
import { Participant, Track } from 'livekit-client';
import { RemoteParticipantTile } from './RemoteParticipantTile';
import { LocalParticipantTile } from './LocalParticipantTile';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ParticipantGridProps {
  showVideo: boolean;
  className?: string;
}

const ITEMS_PER_PAGE = 25;

function getRowDistribution(n: number) {
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  const distribution: number[] = [];
  let remaining = n;
  for (let i = 0; i < rows; i++) {
    const itemsForThisRow = Math.ceil(remaining / (rows - i));
    distribution.push(itemsForThisRow);
    remaining -= itemsForThisRow;
  }
  return distribution;
}

export function ParticipantGrid({ showVideo, className }: ParticipantGridProps) {
  const remoteParticipants = useRemoteParticipants();
  const { localParticipant } = useLocalParticipant();
  const [currentPage, setCurrentPage] = useState(0);

  const allParticipants: (Participant | 'local')[] = [...remoteParticipants, 'local'];

  // Detect screen sharing
  const screenShareRemote = remoteParticipants.find((p) =>
    p.getTrackPublication(Track.Source.ScreenShare)
  );
  const isLocalSharing = localParticipant.isScreenShareEnabled;
  const screenSharer = screenShareRemote || (isLocalSharing ? 'local' : null);

  const totalParticipants = allParticipants.length;
  const totalPages = Math.ceil(totalParticipants / ITEMS_PER_PAGE);

  if (currentPage >= totalPages && totalPages > 0) {
    setCurrentPage(totalPages - 1);
  }

  const startIndex = currentPage * ITEMS_PER_PAGE;
  const pageParticipants = allParticipants.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Layout 1: Screen Sharing Split View
  if (screenSharer) {
    const isLocalScreenShare = screenSharer === 'local';
    
    return (
      <div className={cn('flex-1 flex min-h-0 bg-black', className)}>
        {/* Main Screen Share Area */}
        <div className="flex-[3] relative p-4 flex items-center justify-center bg-gray-900 overflow-hidden">
           {isLocalScreenShare ? (
             <LocalParticipantTile source={Track.Source.ScreenShare} className="w-full h-full rounded-none border-none" />
           ) : (
             <RemoteParticipantTile participant={screenSharer as Participant} source={Track.Source.ScreenShare} className="w-full h-full rounded-none border-none" />
           )}
        </div>
        
        {/* Sidebar Participants */}
        <div className="flex-1 max-w-[300px] border-l border-gray-800 bg-gray-900 p-4 flex flex-col gap-4 overflow-y-auto">
          {allParticipants.map((p) => {
            const isLocal = p === 'local';
            const key = isLocal ? 'local-participant' : p.identity;
            return (
              <div key={key} className="w-full aspect-video flex-shrink-0">
                {isLocal ? (
                  <LocalParticipantTile className="w-full h-full shadow-xl rounded-xl" />
                ) : (
                  <RemoteParticipantTile participant={p} className="w-full h-full shadow-xl rounded-xl" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Layout 2: 2-person Picture-in-Picture
  if (totalParticipants === 2 && currentPage === 0) {
    const remoteP = remoteParticipants[0];
    return (
      <div className={cn('relative flex-1 bg-black overflow-hidden', className)}>
        {remoteP && (
          <div className="absolute inset-0">
            <RemoteParticipantTile participant={remoteP} className="w-full h-full rounded-none border-none" />
          </div>
        )}
        <div className="absolute bottom-6 right-6 w-48 sm:w-64 aspect-video z-10 shadow-2xl rounded-xl overflow-hidden border-2 border-gray-700/50 bg-gray-900">
          <LocalParticipantTile className="w-full h-full rounded-none border-none" />
        </div>
      </div>
    );
  }

  // Layout 3: Zero-Scroll Grid
  const n = pageParticipants.length;
  const distribution = getRowDistribution(n);
  const rows: (Participant | 'local')[][] = [];
  let itemIndex = 0;
  for (const count of distribution) {
    rows.push(pageParticipants.slice(itemIndex, itemIndex + count));
    itemIndex += count;
  }

  return (
    <div className={cn('flex-1 flex flex-col h-full relative overflow-hidden bg-black p-4 sm:p-8', className)}>
      <div className="flex-1 flex flex-col gap-4 sm:gap-6 w-full h-full justify-center min-h-0">
        {rows.map((rowItems, rowIndex) => (
          <div key={rowIndex} className="flex-1 flex justify-center gap-4 sm:gap-6 w-full min-h-0">
            {rowItems.map((p) => {
              const isLocal = p === 'local';
              const key = isLocal ? 'local-participant' : p.identity;
              return (
                <div 
                  key={key} 
                  className="flex-1 h-full flex justify-center"
                  style={{
                    flexBasis: `${100 / Math.max(...distribution)}%`,
                    maxWidth: `${100 / Math.max(...distribution)}%`
                  }}
                >
                  {isLocal ? (
                    <LocalParticipantTile className="w-full h-full shadow-xl rounded-xl bg-gray-900" />
                  ) : (
                    <RemoteParticipantTile
                      participant={p}
                      className="w-full h-full shadow-xl rounded-xl bg-gray-900"
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-800/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-4 shadow-xl z-20 border border-gray-700/50">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="p-1 rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-white">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1}
            className="p-1 rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
