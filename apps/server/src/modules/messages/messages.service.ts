import { Prisma } from '@prisma/client';
import { prisma } from '../../prisma/prisma.service';
import { ApiError } from '../../utils/ApiError';
import { validateConversationMembership } from '../conversations/conversations.service';

export async function getMessages(conversationId: string, userId: string) {
  const isMember = await validateConversationMembership(conversationId, userId);
  if (!isMember) throw new ApiError(403, 'Not a member of this conversation');

  return prisma.message.findMany({
    where: { conversationId },
    include: {
      sender: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: 'asc' },
    take: 100,
  });
}

export async function sendMessage(conversationId: string, senderId: string, text: string) {
  const isMember = await validateConversationMembership(conversationId, senderId);
  if (!isMember) throw new ApiError(403, 'Not a member of this conversation');

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      text,
      type: 'TEXT',
    },
    include: {
      sender: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });

  // Update conversation updatedAt
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return message;
}

export async function createSystemMessage(
  conversationId: string,
  text: string,
  metadata?: Prisma.InputJsonValue
) {
  return prisma.message.create({
    data: {
      conversationId,
      text,
      type: 'CALL',
      metadata: metadata ?? Prisma.JsonNull,
    },
    include: {
      sender: { select: { id: true, name: true, avatarUrl: true } },
    },
  });
}
