import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authMiddleware } from './auth.middleware';
import * as authPackage from '@vochatix/auth';
import { authRepository } from '../modules/auth/auth.repository';

vi.mock('@vochatix/auth', () => ({
  verifyJwt: vi.fn(),
}));

vi.mock('../modules/auth/auth.repository', () => ({
  authRepository: {
    findUserById: vi.fn(),
  },
}));

describe('auth.middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should authenticate a valid token and user', async () => {
    const mockReq = {
      headers: {
        authorization: 'Bearer valid_token'
      }
    } as any;
    const mockRes = {} as any;
    const mockNext = vi.fn();

    vi.mocked(authPackage.verifyJwt).mockReturnValue({ userId: 'user123', email: 'test@example.com' });
    vi.mocked(authRepository.findUserById).mockResolvedValue({ id: 'user123', email: 'test@example.com' } as any);

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(authPackage.verifyJwt).toHaveBeenCalledWith('valid_token');
    expect(authRepository.findUserById).toHaveBeenCalledWith('user123');
    expect(mockReq.user).toEqual({ id: 'user123', email: 'test@example.com' });
    expect(mockNext).toHaveBeenCalledWith(); // success has no args
  });

  it('should throw if no token is provided', async () => {
    const mockReq = { headers: {} } as any;
    const mockRes = {} as any;
    const mockNext = vi.fn();

    await authMiddleware(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ message: 'Authorization token required' }));
  });
});
