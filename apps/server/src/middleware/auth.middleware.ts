import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '@vochatix/auth';
import { ApiError } from '../errors/ApiError';
import { authRepository } from '../modules/auth/auth.repository';

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authorization token required');
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyJwt(token);

    const user = await authRepository.findUserById(payload.userId);

    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
