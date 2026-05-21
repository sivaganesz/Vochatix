import { useState, useCallback } from 'react';
import api from '@/lib/api';
import { User } from '@/types/chat.types';
import { useAuthStore } from '@/store/auth.store';

export function useProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setAuth, user: currentUser, token } = useAuthStore();

  const getProfile = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get(`/api/users/${userId}`);
      return res.data.data.user as User;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch profile');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.patch('/api/users/me', data);
      const updatedUser = res.data.data.user;
      
      // Update global auth store
      if (token && currentUser) {
        setAuth({ ...currentUser, ...updatedUser }, token);
      }
      
      return updatedUser as User;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setAuth, currentUser, token]);

  return { getProfile, updateProfile, isLoading, error };
}
