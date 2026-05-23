import { Prisma } from '@prisma/client';
import { prisma } from '@vochatix/db';

export const messagesRepository = {
  findMessagesByConversation(conversationId: string, take: number = 100) {
    return prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'asc' },
      take,
    });
  },

  createMessage(data: Prisma.MessageUncheckedCreateInput) {
    return prisma.message.create({
      data,
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });
  },

  updateConversationUpdatedAt(conversationId: string) {
    return prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
  },

  markMessagesAsSeen(conversationId: string, excludeSenderId: string) {
    return prisma.message.updateMany({
      where: {
        conversationId,
        OR: [
          { senderId: { not: excludeSenderId } },
          { senderId: null }
        ],
        status: { not: 'SEEN' },
      },
      data: { status: 'SEEN' },
    });
  }
};
