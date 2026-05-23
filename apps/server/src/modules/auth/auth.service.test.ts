import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerUser } from './auth.service';
import { authRepository } from './auth.repository';
import { createMockUser } from '@vochatix/testing';
import * as authPackage from '@vochatix/auth';

vi.mock('./auth.repository', () => ({
  authRepository: {
    findUserByEmail: vi.fn(),
    createUser: vi.fn(),
  },
}));

vi.mock('@vochatix/auth', () => ({
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
  signJwt: vi.fn(),
}));

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should successfully register a new user', async () => {
      const mockInput = { name: 'Test User', email: 'test@example.com', password: 'password123' };
      const mockCreatedUser = createMockUser({ name: mockInput.name, email: mockInput.email });
      
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
      vi.mocked(authPackage.hashPassword).mockResolvedValue('hashed_pw');
      vi.mocked(authRepository.createUser).mockResolvedValue(mockCreatedUser);
      vi.mocked(authPackage.signJwt).mockReturnValue('fake_jwt_token');

      const result = await registerUser(mockInput);

      expect(authRepository.findUserByEmail).toHaveBeenCalledWith(mockInput.email);
      expect(authPackage.hashPassword).toHaveBeenCalledWith(mockInput.password);
      expect(authRepository.createUser).toHaveBeenCalledWith({
        name: mockInput.name,
        email: mockInput.email,
        passwordHash: 'hashed_pw',
      });
      expect(authPackage.signJwt).toHaveBeenCalledWith({
        userId: mockCreatedUser.id,
        email: mockCreatedUser.email,
      });

      expect(result).toEqual({
        user: mockCreatedUser,
        token: 'fake_jwt_token',
      });
    });

    it('should throw ApiError if email is already registered', async () => {
      const mockInput = { name: 'Test User', email: 'test@example.com', password: 'password123' };
      const existingUser = createMockUser({ email: mockInput.email });
      
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(existingUser);

      await expect(registerUser(mockInput)).rejects.toThrow('Email already registered');
      
      expect(authRepository.createUser).not.toHaveBeenCalled();
    });
  });
});
