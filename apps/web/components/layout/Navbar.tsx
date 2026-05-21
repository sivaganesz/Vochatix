'use client';

import { MessageSquare, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/auth.store';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/cn';

export function Navbar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { logout } = useAuth();

  const navItems = [
    { href: '/chat', icon: MessageSquare, label: 'Chats' },
  ];

  return (
    <nav className="flex flex-col items-center gap-4 py-4 px-2 bg-gray-900 h-full w-16">
      {/* Logo */}
      <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center mb-2">
        <MessageSquare className="h-5 w-5 text-white" />
      </div>

      {/* Nav items */}
      <div className="flex-1 flex flex-col gap-2">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'h-10 w-10 rounded-xl flex items-center justify-center transition-colors',
              pathname.startsWith(href)
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            )}
            title={label}
          >
            <Icon className="h-5 w-5" />
          </Link>
        ))}
      </div>

      {/* Bottom: user avatar + logout */}
      <div className="flex flex-col items-center gap-3">
        {user && (
          <Avatar name={user.name} avatarUrl={user.avatarUrl} size="sm" isOnline />
        )}
        <button
          onClick={logout}
          className="h-10 w-10 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          title="Sign out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </nav>
  );
}
