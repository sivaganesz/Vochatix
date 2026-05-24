import { Prisma } from '@prisma/client';
import { prisma } from '@vochatix/db';

const conversationInclude = (userId: string) => ({
  members: {
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true, isOnline: true, lastSeenAt: true },
      },
    },
  },
  messages: {
    orderBy: { createdAt: 'desc' as any },
    take: 1,
    include: { sender: { select: { id: true, name: true } } },
  },
  _count: {
    select: {
      messages: {
        where: {
          OR: [
            { senderId: { not: userId } },
            { senderId: null }
          ],
          status: { not: 'SEEN' as any },
        },
      },
    },
  },
});

export const conversationsRepository = {
  findUserConversations(userId: string) {
    return prisma.conversation.findMany({
      where: { 
        members: { 
          some: { 
            userId,
            isHidden: false
          } 
        } 
      },
      include: conversationInclude(userId),
      orderBy: { updatedAt: 'desc' },
    });
  },

  createConversation(data: Prisma.ConversationCreateInput, userId: string) {
    return prisma.conversation.create({
      data,
      include: conversationInclude(userId),
    });
  },

  findDirectConversation(userId: string, targetUserId: string) {
    return prisma.conversation.findFirst({
      where: {
        type: 'DIRECT',
        AND: [
          { members: { some: { userId } } },
          { members: { some: { userId: targetUserId } } },
        ],
      },
      include: conversationInclude(userId),
    });
  },

  findConversationById(conversationId: string, userId: string) {
    return prisma.conversation.findFirst({
      where: {
        id: conversationId,
        members: { some: { userId } },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true, isOnline: true, lastSeenAt: true },
            },
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                OR: [
                  { senderId: { not: userId } },
                  { senderId: null }
                ],
                status: { not: 'SEEN' as any },
              },
            },
          },
        },
      },
    });
  },

  findConversationWithMembers(conversationId: string) {
    return prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { members: true },
    });
  },

  updateConversation(conversationId: string, data: any) {
    return prisma.conversation.update({
      where: { id: conversationId },
      data,
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true, isOnline: true, lastSeenAt: true },
            },
          },
        },
      },
    });
  },

  addMembers(conversationId: string, userIds: string[]) {
    return prisma.conversationMember.createMany({
      data: userIds.map((userId) => ({ conversationId, userId })),
    });
  },

  removeMember(conversationId: string, userId: string) {
    return prisma.conversationMember.delete({
      where: { conversationId_userId: { conversationId, userId } },
    });
  },

  checkMembership(conversationId: string, userId: string) {
    return prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
  },

  findUsersByIds(userIds: string[]) {
    return prisma.user.findMany({
      where: { id: { in: userIds } },
    });
  },

  findUserById(userId: string) {
    return prisma.user.findUnique({ where: { id: userId } });
  },

  createSystemMessage(conversationId: string, text: string) {
    return prisma.message.create({
      data: {
        conversationId,
        type: 'SYSTEM',
        text,
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } }
      }
    });
  },

  updateMemberState(conversationId: string, userId: string, data: { isMuted?: boolean; isUnread?: boolean; isHidden?: boolean }) {
    return prisma.conversationMember.update({
      where: { conversationId_userId: { conversationId, userId } },
      data,
    });
  }
};
