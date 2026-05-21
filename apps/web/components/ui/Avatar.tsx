import { cn } from '@/lib/cn';

interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  className?: string;
}

const COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-yellow-500',
];

function getColorForName(name: string): string {
  const index = name.charCodeAt(0) % COLORS.length;
  return COLORS[index];
}

export function Avatar({ name, avatarUrl, size = 'md', isOnline, className }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-xl',
  };

  const dotSizes = {
    sm: 'h-2 w-2 border',
    md: 'h-2.5 w-2.5 border',
    lg: 'h-3 w-3 border-2',
    xl: 'h-3.5 w-3.5 border-2',
  };

  return (
    <div className={cn('relative inline-flex flex-shrink-0', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-semibold text-white overflow-hidden',
          sizes[size],
          avatarUrl ? '' : getColorForName(name)
        )}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </div>

      {isOnline !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-white',
            dotSizes[size],
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          )}
        />
      )}
    </div>
  );
}
