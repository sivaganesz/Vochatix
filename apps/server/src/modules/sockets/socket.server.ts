import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { corsOptions } from '../../config/cors';
import { authenticateSocket } from './socket.auth';
import { handlePresence } from './presence.socket';
import { handleChatEvents } from './chat.socket';
import { handleCallEvents } from './call.socket';
import { AuthenticatedSocket } from '../../types/socket.types';
import { prisma } from '../../prisma/prisma.service';
import { logger } from '../../utils/logger';
import { setSocketServer } from './socket.instance';

export function createSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOptions.origin,
      credentials: corsOptions.credentials,
      methods: corsOptions.methods as string[],
    },
  });

  // Socket authentication middleware
  io.use(authenticateSocket);

  io.on('connection', async (socket) => {
    const authenticatedSocket = socket as AuthenticatedSocket;
    const { userId } = authenticatedSocket;

    logger.info(`Socket connected: userId=${userId} socketId=${socket.id}`);

    // Join personal room for direct notifications
    await socket.join(`user:${userId}`);

    // Auto-join all conversation rooms this user is member of
    const memberships = await prisma.conversationMember.findMany({
      where: { userId },
      select: { conversationId: true },
    });

    for (const { conversationId } of memberships) {
      await socket.join(`conversation:${conversationId}`);
    }

    // Register event handlers
    await handlePresence(io, authenticatedSocket);
    handleChatEvents(io, authenticatedSocket);
    handleCallEvents(io, authenticatedSocket);

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: userId=${userId} reason=${reason}`);
    });

    socket.on('error', (error) => {
      logger.error(`Socket error: userId=${userId}`, error);
    });
  });

  setSocketServer(io);

  return io;
}
