import { create } from 'zustand';
import { AuthUser } from '@/types/auth.types';
import { setAuthToken, clearAuthToken, getAuthToken } from '@/lib/auth-storage';

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  initializeFromStorage: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  setAuth: (user, token) => {
    setAuthToken(token);
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  clearAuth: () => {
    clearAuthToken();
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  initializeFromStorage: () => {
    const token = getAuthToken();
    if (!token) {
      set({ isLoading: false });
    }
    // The actual user will be fetched by the AuthProvider
  },
}));
