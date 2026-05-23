export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

