import { Prisma, MessageStatus } from '@prisma/client';
import { ApiError } from '../../errors/ApiError';
import { validateConversationMembership } from '../conversations/conversations.service';
import { messagesRepository } from './messages.repository';

export async function getMessages(conversationId: string, userId: string) {
  const isMember = await validateConversationMembership(conversationId, userId);
  if (!isMember) throw new ApiError(403, 'Not a member of this conversation');

  return messagesRepository.findMessagesByConversation(conversationId);
}

export async function sendMessage(conversationId: string, senderId: string, text: string) {
  const isMember = await validateConversationMembership(conversationId, senderId);
  if (!isMember) throw new ApiError(403, 'Not a member of this conversation');

  const message = await messagesRepository.createMessage({
    conversationId,
    senderId,
    text,
    type: 'TEXT',
  });

  // Update conversation updatedAt (should ideally call conversation service)
  await messagesRepository.updateConversationUpdatedAt(conversationId);
  await messagesRepository.unhideAndMarkUnread(conversationId, senderId);

  return message;
}

export async function createSystemMessage(
  conversationId: string,
  text: string,
  metadata?: Prisma.InputJsonValue,
  status?: any
) {
  const message = await messagesRepository.createMessage({
    conversationId,
    text,
    type: 'CALL',
    status: status ?? 'SENT',
    metadata: metadata ?? Prisma.JsonNull,
  });

  await messagesRepository.unhideAndMarkUnread(conversationId, 'SYSTEM');

  return message;
}

export async function markMessagesAsRead(conversationId: string, userId: string) {
  const isMember = await validateConversationMembership(conversationId, userId);
  if (!isMember) throw new ApiError(403, 'Not a member of this conversation');

  const result = await messagesRepository.markMessagesAsSeen(conversationId, userId);
  return result.count;
}
