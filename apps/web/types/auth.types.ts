export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  isOnline?: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
}
