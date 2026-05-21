'use client';

import { useConnectionState } from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';
import { Spinner } from '@/components/ui/Spinner';
import { WifiOff, Wifi } from 'lucide-react';
import { cn } from '@/lib/cn';

export function CallStatusBanner() {
  const connectionState = useConnectionState();

  if (connectionState === ConnectionState.Connected) return null;

  const isReconnecting = connectionState === ConnectionState.Reconnecting;
  const isConnecting = connectionState === ConnectionState.Connecting;
  const isDisconnected = connectionState === ConnectionState.Disconnected;

  return (
    <div
      className={cn(
        'absolute top-4 left-1/2 -translate-x-1/2 z-20',
        'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white',
        'shadow-lg backdrop-blur-sm',
        isReconnecting
          ? 'bg-yellow-600/90'
          : isDisconnected
            ? 'bg-red-600/90'
            : 'bg-gray-800/90'
      )}
    >
      {isDisconnected ? (
        <WifiOff className="h-4 w-4" />
      ) : (
        <Spinner size="sm" className="text-white" />
      )}
      <span>
        {isConnecting && 'Connecting to call...'}
        {isReconnecting && 'Reconnecting...'}
        {isDisconnected && 'Disconnected'}
      </span>
    </div>
  );
}
