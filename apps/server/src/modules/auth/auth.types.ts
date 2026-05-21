export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  token: string;
}
