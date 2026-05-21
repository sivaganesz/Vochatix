'use client';

import { useAuthStore } from '@/store/auth.store';
import { useCallback } from 'react';
import api from '@/lib/api';
import { AuthUser } from '@/types/auth.types';
import { connectSocket, disconnectSocket } from '@/lib/socket';

export function useAuth() {
  const { user, token, isLoading, isAuthenticated, setAuth, clearAuth } = useAuthStore();

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await api.post('/api/auth/login', { email, password });
      const { user: loggedInUser, token: authToken } = response.data.data;
      setAuth(loggedInUser as AuthUser, authToken as string);
      connectSocket();
      return loggedInUser as AuthUser;
    },
    [setAuth]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const response = await api.post('/api/auth/register', { name, email, password });
      const { user: newUser, token: authToken } = response.data.data;
      setAuth(newUser as AuthUser, authToken as string);
      connectSocket();
      return newUser as AuthUser;
    },
    [setAuth]
  );

  const logout = useCallback(() => {
    disconnectSocket();
    clearAuth();
  }, [clearAuth]);

  return { user, token, isLoading, isAuthenticated, login, register, logout };
}
