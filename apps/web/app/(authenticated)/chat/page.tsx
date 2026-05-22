'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { EmptyChatState } from '@/components/chat/EmptyChatState';
import { Spinner } from '@/components/ui/Spinner';

export default function ChatPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <ChatLayout>
      <EmptyChatState />
    </ChatLayout>
  );
}
