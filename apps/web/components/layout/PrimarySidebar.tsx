'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, MessageSquare, Phone, Cloud, Calendar, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/auth.store';

const navItems = [
  { icon: Bell, label: 'Activity', href: '/notifications' },
  { icon: MessageSquare, label: 'Chat', href: '/chat' },
  { icon: Phone, label: 'Calls', href: '/calls' },
  { icon: Cloud, label: 'OneDrive', href: '/cloud' },
  { icon: Calendar, label: 'Calendar', href: '/calendar' },
  { icon: Users, label: 'Meetings', href: '/meetings' },
];

export function PrimarySidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <aside className="w-[68px] flex-shrink-0 flex flex-col items-center py-4 bg-[#ebebeb] border-r border-gray-300 h-full">
      <div className="flex-1 flex flex-col items-center gap-6 w-full">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center w-full py-1 text-gray-500 hover:text-blue-600 transition-colors group cursor-pointer",
                isActive && "text-blue-600"
              )}
              title={item.label}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-md" />
              )}
              <Icon className="h-6 w-6 mb-1" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium opacity-80">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-6 w-full">
        <Link 
          href="/settings"
          className="text-gray-500 hover:text-blue-600 transition-colors"
          title="Settings"
        >
          <Settings className="h-6 w-6" strokeWidth={2} />
        </Link>
        <Link href="/profile" title="Profile">
          {user ? (
            <Avatar name={user.name} avatarUrl={user.avatarUrl} size="sm" className="ring-2 ring-transparent hover:ring-blue-500 transition-all" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300" />
          )}
        </Link>
      </div>
    </aside>
  );
}
