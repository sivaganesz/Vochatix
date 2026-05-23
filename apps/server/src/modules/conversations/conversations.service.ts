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
      _count: {
        select: {
          messages: {
            where: {
              OR: [
                { senderId: { not: userId } },
                { senderId: null }
              ],
              status: { not: 'SEEN' },
            },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return conversations.map(conv => {
    const { _count, ...rest } = conv;
    return {
      ...rest,
      unreadCount: _count.messages,
    };
  });
}

export async function createGroupConversation(
  userId: string,
  targetUserIds: string[],
  name?: string,
  avatarUrl?: string
) {
  // Validate all target users exist
  const uniqueTargetUserIds = Array.from(new Set(targetUserIds));
  const targetUsers = await prisma.user.findMany({
    where: { id: { in: uniqueTargetUserIds } },
  });

  if (targetUsers.length !== uniqueTargetUserIds.length) {
    throw new ApiError(400, 'One or more target users not found');
  }

  const allMemberIds = [userId, ...uniqueTargetUserIds];

  const conversation = await prisma.conversation.create({
    data: {
      type: 'GROUP',
      name,
      avatarUrl,
      members: {
        create: allMemberIds.map((id) => ({ userId: id })),
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
      _count: {
        select: {
          messages: {
            where: {
              OR: [
                { senderId: { not: userId } },
                { senderId: null }
              ],
              status: { not: 'SEEN' },
            },
          },
        },
      },
    },
  });

  const { _count, ...rest } = conversation;
  return {
    ...rest,
    unreadCount: _count.messages,
  };
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
      _count: {
        select: {
          messages: {
            where: {
              OR: [
                { senderId: { not: userId } },
                { senderId: null }
              ],
              status: { not: 'SEEN' },
            },
          },
        },
      },
    },
  });

  if (existing) {
    const { _count, ...rest } = existing;
    return {
      ...rest,
      unreadCount: _count.messages,
    };
  }

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
      _count: {
        select: {
          messages: {
            where: {
              OR: [
                { senderId: { not: userId } },
                { senderId: null }
              ],
              status: { not: 'SEEN' },
            },
          },
        },
      },
    },
  });

  const { _count, ...rest } = conversation;
  return {
    ...rest,
    unreadCount: _count.messages,
  };
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
      _count: {
        select: {
          messages: {
            where: {
              OR: [
                { senderId: { not: userId } },
                { senderId: null }
              ],
              status: { not: 'SEEN' },
            },
          },
        },
      },
    },
  });

  if (!conversation) throw new ApiError(404, 'Conversation not found');
  
  const { _count, ...rest } = conversation;
  return {
    ...rest,
    unreadCount: _count.messages,
  };
}

export async function updateGroupName(conversationId: string, userId: string, name: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { members: true },
  });

  if (!conversation || conversation.type !== 'GROUP') {
    throw new ApiError(404, 'Group conversation not found');
  }

  if (!conversation.members.some((m) => m.userId === userId)) {
    throw new ApiError(403, 'You are not a member of this group');
  }

  const updatedConversation = await prisma.conversation.update({
    where: { id: conversationId },
    data: { name },
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

  return updatedConversation;
}

export async function addGroupMembers(conversationId: string, userId: string, targetUserIds: string[]) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { members: true },
  });

  if (!conversation || conversation.type !== 'GROUP') {
    throw new ApiError(404, 'Group conversation not found');
  }

  if (!conversation.members.some((m) => m.userId === userId)) {
    throw new ApiError(403, 'You are not a member of this group');
  }

  const existingMemberIds = new Set(conversation.members.map((m) => m.userId));
  const newTargetUserIds = targetUserIds.filter((id) => !existingMemberIds.has(id));

  if (newTargetUserIds.length === 0) {
    return conversation; // No new members to add
  }

  // Create members
  await prisma.conversationMember.createMany({
    data: newTargetUserIds.map((id) => ({
      conversationId,
      userId: id,
    })),
  });

  const inviter = await prisma.user.findUnique({ where: { id: userId } });
  const addedUsers = await prisma.user.findMany({ where: { id: { in: newTargetUserIds } } });
  const addedNames = addedUsers.map(u => u.name).join(', ');

  // Create system message
  const systemMessage = await prisma.message.create({
    data: {
      conversationId,
      type: 'SYSTEM',
      text: `${inviter?.name || 'Someone'} added ${addedNames} to the group.`,
    },
    include: {
      sender: { select: { id: true, name: true, avatarUrl: true } }
    }
  });

  const { getSocketServer } = await import('../sockets/socket.instance');
  const io = getSocketServer();
  io.to(`conversation:${conversationId}`).emit('message:new', systemMessage);

  return prisma.conversation.findUnique({
    where: { id: conversationId },
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
}

export async function leaveGroup(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { members: true },
  });

  if (!conversation || conversation.type !== 'GROUP') {
    throw new ApiError(404, 'Group conversation not found');
  }

  if (!conversation.members.some((m) => m.userId === userId)) {
    throw new ApiError(403, 'You are not a member of this group');
  }

  await prisma.conversationMember.delete({
    where: { conversationId_userId: { conversationId, userId } },
  });

  const leaver = await prisma.user.findUnique({ where: { id: userId } });

  // Create system message
  const systemMessage = await prisma.message.create({
    data: {
      conversationId,
      type: 'SYSTEM',
      text: `${leaver?.name || 'Someone'} left the group.`,
    },
    include: {
      sender: { select: { id: true, name: true, avatarUrl: true } }
    }
  });

  const { getSocketServer } = await import('../sockets/socket.instance');
  const io = getSocketServer();
  io.to(`conversation:${conversationId}`).emit('message:new', systemMessage);

  return { success: true };
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
