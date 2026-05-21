import { prisma } from '../../prisma/prisma.service';
import { hashPassword, comparePassword } from '../../utils/password';
import { signJwt } from '../../utils/jwt';
import { ApiError } from '../../utils/ApiError';
import { RegisterInput, LoginInput } from './auth.validation';
import { AuthResponse } from './auth.types';

export async function registerUser(input: RegisterInput): Promise<AuthResponse> {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new ApiError(409, 'Email already registered');
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
    },
    select: { id: true, name: true, email: true, avatarUrl: true },
  });

  const token = signJwt({ userId: user.id, email: user.email });

  return { user, token };
}

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

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
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      dob: true,
      bio: true,
      socialLinks: true,
      isOnline: true,
      lastSeenAt: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
}
