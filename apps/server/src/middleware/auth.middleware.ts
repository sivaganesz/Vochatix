import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { prisma } from '../prisma/prisma.service';

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

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, avatarUrl: true, isOnline: true },
    });

    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
