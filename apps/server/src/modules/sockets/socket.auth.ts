import { Socket } from 'socket.io';
import { verifyJwt } from '../../utils/jwt';
import { prisma } from '../../prisma/prisma.service';
import { AuthenticatedSocket } from '../../types/socket.types';

export async function authenticateSocket(
  socket: Socket,
  next: (err?: Error) => void
): Promise<void> {
  try {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      next(new Error('Authentication token required'));
      return;
    }

    const payload = verifyJwt(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true },
    });

    if (!user) {
      next(new Error('User not found'));
      return;
    }

    (socket as AuthenticatedSocket).userId = user.id;
    (socket as AuthenticatedSocket).userEmail = user.email;
    next();
  } catch {
    next(new Error('Invalid authentication token'));
  }
}
