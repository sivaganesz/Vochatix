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

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
