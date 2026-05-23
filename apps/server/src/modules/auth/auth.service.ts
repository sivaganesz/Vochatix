import { authRepository } from './auth.repository';
import { hashPassword, comparePassword } from '@vochatix/auth';
import { signJwt } from '@vochatix/auth';
import { ApiError } from '../../errors/ApiError';
import { RegisterInput, LoginInput } from './auth.validation';
import { AuthResponse } from './auth.types';

export async function registerUser(input: RegisterInput): Promise<AuthResponse> {
  const existingUser = await authRepository.findUserByEmail(input.email);

  if (existingUser) {
    throw new ApiError(409, 'Email already registered');
  }

  const passwordHash = await hashPassword(input.password);

  const user = await authRepository.createUser({ name: input.name, email: input.email, passwordHash });

  const token = signJwt({ userId: user.id, email: user.email });

  return { user, token };
}

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  const user = await authRepository.findUserByEmail(input.email);

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await comparePassword(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signJwt({ userId: user.id, email: user.email });

  return {
    user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
    token,
  };
}

export async function getCurrentUser(userId: string) {
  const user = await authRepository.findUserById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
}

