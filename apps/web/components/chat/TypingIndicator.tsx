interface TypingIndicatorProps {
  typingUserNames: string[];
}

export function TypingIndicator({ typingUserNames }: TypingIndicatorProps) {
  if (typingUserNames.length === 0) return null;

  const text =
    typingUserNames.length === 1
      ? `${typingUserNames[0]} is typing...`
      : `${typingUserNames.join(', ')} are typing...`;

  return (
    <div className="px-4 pb-1">
      <div className="flex items-center gap-2">
        {/* Animated dots */}
        <div className="flex items-center gap-1 bg-white rounded-full px-3 py-2 shadow-sm border border-gray-200 w-fit">
          <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-xs text-gray-500">{text}</span>
      </div>
    </div>
  );
}
