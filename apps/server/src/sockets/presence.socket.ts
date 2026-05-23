import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../types/socket.types';
import { prisma } from '@vochatix/db';
import { SOCKET_EVENTS } from './socket.events';
import { logger } from '@vochatix/logger';

export async function handlePresence(io: Server, socket: AuthenticatedSocket): Promise<void> {
  const { userId } = socket;

  // Mark user online
  await prisma.user.update({
    where: { id: userId },
    data: { isOnline: true, lastSeenAt: new Date() },
  });

  // Get conversations where user is a member to notify those users
  const conversations = await prisma.conversationMember.findMany({
    where: { userId },
    select: { conversationId: true },
  });

  // Notify other members in each conversation
  for (const { conversationId } of conversations) {
    socket.to(`conversation:${conversationId}`).emit(SOCKET_EVENTS.USER_ONLINE, { userId });
  }

  logger.info(`User ${userId} is now online`);

  socket.on(SOCKET_EVENTS.DISCONNECT, async () => {
    // Check if user has other active sockets
    const sockets = await io.in(`user:${userId}`).fetchSockets();
    if (sockets.length === 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { isOnline: false, lastSeenAt: new Date() },
      });

      for (const { conversationId } of conversations) {
        socket
          .to(`conversation:${conversationId}`)
          .emit(SOCKET_EVENTS.USER_OFFLINE, { userId });
      }

      logger.info(`User ${userId} is now offline`);
    }
  });
}
