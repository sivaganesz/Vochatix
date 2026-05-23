import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../types/socket.types';
import { MessageSendPayload, TypingPayload } from '@vochatix/events';
import { prisma } from '@vochatix/db';
import { SOCKET_EVENTS } from './socket.events';
import { sendMessage } from '../modules/messages/messages.service';
import { logger } from '@vochatix/logger';

export function handleChatEvents(io: Server, socket: AuthenticatedSocket): void {
  const { userId } = socket;

  // Handle message send via socket
  socket.on(SOCKET_EVENTS.MESSAGE_SEND, async (payload: MessageSendPayload) => {
    try {
      const { conversationId, text } = payload;
      const message = await sendMessage(conversationId, userId, text);

      // Emit to all members in the conversation room
      io.to(`conversation:${conversationId}`).emit(SOCKET_EVENTS.MESSAGE_NEW, { message });

      logger.debug(`Message sent in conversation ${conversationId} by user ${userId}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to send message' });
      logger.error('Error sending message:', error);
    }
  });

  // Handle typing start
  socket.on(SOCKET_EVENTS.TYPING_START, (payload: TypingPayload) => {
    try {
      const { conversationId } = payload;
      socket.to(`conversation:${conversationId}`).emit(SOCKET_EVENTS.TYPING_START, {
        userId,
        conversationId,
      });
    } catch (error) {
      logger.error('Error handling typing start:', error);
    }
  });

  // Handle typing stop
  socket.on(SOCKET_EVENTS.TYPING_STOP, (payload: TypingPayload) => {
    try {
      const { conversationId } = payload;
      socket.to(`conversation:${conversationId}`).emit(SOCKET_EVENTS.TYPING_STOP, {
        userId,
        conversationId,
      });
    } catch (error) {
      logger.error('Error handling typing stop:', error);
    }
  });

  // Join conversation rooms on socket connect
  socket.on('conversation:join', async ({ conversationId }: { conversationId: string }) => {
    try {
      // Verify membership before joining
      const member = await prisma.conversationMember.findUnique({
        where: { conversationId_userId: { conversationId, userId } },
      });
      if (member) {
        await socket.join(`conversation:${conversationId}`);
        logger.debug(`User ${userId} joined conversation room ${conversationId}`);
      }
    } catch (error) {
      logger.error('Error joining conversation room:', error);
    }
  });
}

