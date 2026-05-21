import { Message } from '@/types/chat.types';
import { cn } from '@/lib/cn';
import { formatTime } from '@/lib/date';
import { CallHistoryItem } from './CallHistoryItem';

interface MessageBubbleProps {
  message: Message;
  isSelf: boolean;
}

export function MessageBubble({ message, isSelf }: MessageBubbleProps) {
  if (message.type === 'CALL' || message.type === 'SYSTEM') {
    return <CallHistoryItem message={message} />;
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
        <p className="leading-relaxed break-words whitespace-pre-wrap">{message.text}</p>
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
