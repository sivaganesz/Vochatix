import { Message } from '@/types/chat.types';
import { cn } from '@/lib/cn';
import { formatTime } from '@/lib/date';
import { Phone, Video, PhoneOff, PhoneMissed } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isSelf: boolean;
}

function CallMessageBubble({ message }: { message: Message }) {
  const metadata = message.metadata as {
    callType?: string;
    status?: string;
    duration?: number;
  } | null;

  const callType = metadata?.callType ?? 'AUDIO';
  const status = metadata?.status ?? '';

  const Icon = callType === 'VIDEO' ? Video : Phone;

  const isEnded = status === 'ENDED';
  const isMissed = status === 'MISSED';
  const isRejected = status === 'REJECTED';

  return (
    <div className="flex justify-center my-3">
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-full text-sm',
          isMissed || isRejected
            ? 'bg-red-50 text-red-700'
            : 'bg-gray-100 text-gray-600'
        )}
      >
        {isMissed ? (
          <PhoneMissed className="h-4 w-4" />
        ) : isRejected || status === 'ENDED' ? (
          <PhoneOff className="h-4 w-4" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
        <span>{message.text}</span>
      </div>
    </div>
  );
}

export function MessageBubble({ message, isSelf }: MessageBubbleProps) {
  if (message.type === 'CALL' || message.type === 'SYSTEM') {
    return <CallMessageBubble message={message} />;
  }

  return (
    <div className={cn('flex', isSelf ? 'justify-end' : 'justify-start', 'mb-1')}>
      <div
        className={cn(
          'max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm',
          isSelf
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md shadow-sm'
        )}
      >
        <p className="leading-relaxed break-words">{message.text}</p>
        <p
          className={cn(
            'text-xs mt-1 text-right',
            isSelf ? 'text-blue-100' : 'text-gray-400'
          )}
        >
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
