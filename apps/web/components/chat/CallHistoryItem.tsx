import { Message } from '@/types/chat.types';
import { Phone, Video, PhoneOff, PhoneMissed, PhoneIncoming } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatTime } from '@/lib/date';

interface CallHistoryItemProps {
  message: Message;
}

function formatDuration(seconds: number): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function CallHistoryItem({ message }: CallHistoryItemProps) {
  const meta = message.metadata as {
    callType?: 'AUDIO' | 'VIDEO';
    status?: string;
    duration?: number;
  } | null;

  const callType = meta?.callType ?? 'AUDIO';
  const status = meta?.status ?? '';
  const duration = meta?.duration ?? 0;

  const isVideo = callType === 'VIDEO';
  const CallIcon = isVideo ? Video : Phone;

  let StatusIcon = CallIcon;
  let colorClass = 'text-gray-500';
  let bgClass = 'bg-gray-100';
  const label = message.text ?? '';

  if (status === 'MISSED') {
    StatusIcon = PhoneMissed;
    colorClass = 'text-red-600';
    bgClass = 'bg-red-50';
  } else if (status === 'REJECTED') {
    StatusIcon = PhoneOff;
    colorClass = 'text-red-500';
    bgClass = 'bg-red-50';
  } else if (status === 'ENDED') {
    StatusIcon = PhoneOff;
    colorClass = 'text-gray-600';
    bgClass = 'bg-gray-100';
  } else if (status === 'RINGING') {
    StatusIcon = PhoneIncoming;
    colorClass = 'text-blue-500';
    bgClass = 'bg-blue-50';
  }

  return (
    <div className="flex justify-center my-3">
      <div
        className={cn(
          'flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm max-w-xs',
          bgClass
        )}
      >
        <div className={cn('p-1.5 rounded-full bg-white shadow-sm', colorClass)}>
          <StatusIcon className="h-4 w-4" />
        </div>

        <div className="flex flex-col">
          <span className={cn('font-medium text-xs', colorClass)}>{label}</span>
          {duration > 0 && (
            <span className="text-xs text-gray-400">{formatDuration(duration)}</span>
          )}
        </div>

        <span className="text-xs text-gray-400 ml-1 self-end">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}
