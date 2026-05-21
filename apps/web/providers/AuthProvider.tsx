'use client';

import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { getAuthToken } from '@/lib/auth-storage';
import api from '@/lib/api';
import { AuthUser } from '@/types/auth.types';
import { connectSocket } from '@/lib/socket';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setAuth, setLoading, clearAuth } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/api/auth/me');
        const user = response.data.data.user as AuthUser;
        setAuth(user, token);
        connectSocket();
      } catch {
        clearAuth();
      }
    };

    initializeAuth();
  }, [setAuth, setLoading, clearAuth]);

  return <>{children}</>;
}
