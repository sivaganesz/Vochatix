export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  dob?: string | null;
  bio?: string | null;
  socialLinks?: { platform: string; url: string }[] | null;
  isOnline?: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
}
