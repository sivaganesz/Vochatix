'use client';

import { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/cn';

interface MessageInputProps {
  onSend: (text: string) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  disabled?: boolean;
}

export function MessageInput({
  onSend,
  onTypingStart,
  onTypingStop,
  disabled,
}: MessageInputProps) {
  const [text, setText] = useState('');
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const handleTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTypingStart?.();
    }

    // Reset typing stop timer
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      onTypingStop?.();
    }, 1500);
  }, [onTypingStart, onTypingStop]);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;

    onSend(trimmed);
    setText('');

    // Stop typing
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTypingStop?.();
    }
  }, [text, onSend, onTypingStop]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 py-3 bg-white border-t border-gray-200">
      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          disabled={disabled}
          className={cn(
            'flex-1 resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'placeholder:text-gray-400 max-h-32 overflow-y-auto',
            'disabled:bg-gray-50 disabled:cursor-not-allowed'
          )}
          style={{ scrollbarWidth: 'thin' }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className={cn(
            'p-2.5 rounded-xl transition-colors flex-shrink-0',
            text.trim() && !disabled
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
