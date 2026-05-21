import { prisma } from '../../prisma/prisma.service';
import { ApiError } from '../../utils/ApiError';

export async function getConversations(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: {
      members: { some: { userId } },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              isOnline: true,
              lastSeenAt: true,
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          sender: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return conversations;
}

export async function createDirectConversation(userId: string, targetUserId: string) {
  // Verify target user exists
  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!targetUser) throw new ApiError(404, 'Target user not found');

  // Prevent self-conversation
  if (userId === targetUserId) throw new ApiError(400, 'Cannot create conversation with yourself');

  // Check if direct conversation already exists
  const existing = await prisma.conversation.findFirst({
    where: {
      type: 'DIRECT',
      AND: [
        { members: { some: { userId } } },
        { members: { some: { userId: targetUserId } } },
      ],
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              isOnline: true,
              lastSeenAt: true,
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { sender: { select: { id: true, name: true } } },
      },
    },
  });

  if (existing) return existing;

  // Create new conversation
  const conversation = await prisma.conversation.create({
    data: {
      type: 'DIRECT',
      members: {
        create: [{ userId }, { userId: targetUserId }],
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              isOnline: true,
              lastSeenAt: true,
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { sender: { select: { id: true, name: true } } },
      },
    },
  });

  return conversation;
}

export async function getConversationById(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      members: { some: { userId } },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              isOnline: true,
              lastSeenAt: true,
            },
          },
        },
      },
    },
  });

  if (!conversation) throw new ApiError(404, 'Conversation not found');
  return conversation;
}

export async function validateConversationMembership(
  conversationId: string,
  userId: string
): Promise<boolean> {
  const member = await prisma.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  return !!member;
}
