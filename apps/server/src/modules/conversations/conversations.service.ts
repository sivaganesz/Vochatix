import { ApiError } from '../../errors/ApiError';
import { conversationsRepository } from './conversations.repository';

export async function getConversations(userId: string) {
  const conversations = await conversationsRepository.findUserConversations(userId);

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
  const uniqueTargetUserIds = Array.from(new Set(targetUserIds));
  const targetUsers = await conversationsRepository.findUsersByIds(uniqueTargetUserIds);

  if (targetUsers.length !== uniqueTargetUserIds.length) {
    throw new ApiError(400, 'One or more target users not found');
  }

  const allMemberIds = [userId, ...uniqueTargetUserIds];

  const conversation = await conversationsRepository.createConversation({
    type: 'GROUP',
    name,
    avatarUrl,
    members: {
      create: allMemberIds.map((id) => ({ userId: id })),
    },
  }, userId);

  const { _count, ...rest } = conversation;
  return {
    ...rest,
    unreadCount: _count.messages,
  };
}

export async function createDirectConversation(userId: string, targetUserId: string) {
  const targetUser = await conversationsRepository.findUserById(targetUserId);
  if (!targetUser) throw new ApiError(404, 'Target user not found');

  if (userId === targetUserId) throw new ApiError(400, 'Cannot create conversation with yourself');

  const existing = await conversationsRepository.findDirectConversation(userId, targetUserId);

  if (existing) {
    await conversationsRepository.updateMemberState(existing.id, userId, {
      isHidden: false,
    });
    
    const { _count, ...rest } = existing;
    return {
      ...rest,
      unreadCount: _count.messages,
    };
  }

  const conversation = await conversationsRepository.createConversation({
    type: 'DIRECT',
    members: {
      create: [{ userId }, { userId: targetUserId }],
    },
  }, userId);

  const { _count, ...rest } = conversation;
  return {
    ...rest,
    unreadCount: _count.messages,
  };
}

export async function getConversationById(conversationId: string, userId: string) {
  const conversation = await conversationsRepository.findConversationById(conversationId, userId);

  if (!conversation) throw new ApiError(404, 'Conversation not found');
  
  const { _count, ...rest } = conversation;
  return {
    ...rest,
    unreadCount: _count.messages,
  };
}

export async function updateGroupName(conversationId: string, userId: string, name: string) {
  const conversation = await conversationsRepository.findConversationWithMembers(conversationId);

  if (!conversation || conversation.type !== 'GROUP') {
    throw new ApiError(404, 'Group conversation not found');
  }

  if (!conversation.members.some((m: any) => m.userId === userId)) {
    throw new ApiError(403, 'You are not a member of this group');
  }

  return conversationsRepository.updateConversation(conversationId, { name });
}

export async function addGroupMembers(conversationId: string, userId: string, targetUserIds: string[]) {
  const conversation = await conversationsRepository.findConversationWithMembers(conversationId);

  if (!conversation || conversation.type !== 'GROUP') {
    throw new ApiError(404, 'Group conversation not found');
  }

  if (!conversation.members.some((m: any) => m.userId === userId)) {
    throw new ApiError(403, 'You are not a member of this group');
  }

  const existingMemberIds = new Set(conversation.members.map((m: any) => m.userId));
  const newTargetUserIds = targetUserIds.filter((id) => !existingMemberIds.has(id));

  if (newTargetUserIds.length === 0) {
    return conversation; 
  }

  await conversationsRepository.addMembers(conversationId, newTargetUserIds);

  const inviter = await conversationsRepository.findUserById(userId);
  const addedUsers = await conversationsRepository.findUsersByIds(newTargetUserIds);
  const addedNames = addedUsers.map(u => u.name).join(', ');

  const systemMessage = await conversationsRepository.createSystemMessage(
    conversationId,
    `${inviter?.name || 'Someone'} added ${addedNames} to the group.`
  );

  const { getSocketServer } = await import('../../sockets/socket.instance');
  const io = getSocketServer();
  io.to(`conversation:${conversationId}`).emit('message:new', systemMessage);

  return conversationsRepository.updateConversation(conversationId, {}); // fetch updated
}

export async function leaveGroup(conversationId: string, userId: string) {
  const conversation = await conversationsRepository.findConversationWithMembers(conversationId);

  if (!conversation || conversation.type !== 'GROUP') {
    throw new ApiError(404, 'Group conversation not found');
  }

  if (!conversation.members.some((m: any) => m.userId === userId)) {
    throw new ApiError(403, 'You are not a member of this group');
  }

  await conversationsRepository.removeMember(conversationId, userId);

  const leaver = await conversationsRepository.findUserById(userId);

  const systemMessage = await conversationsRepository.createSystemMessage(
    conversationId,
    `${leaver?.name || 'Someone'} left the group.`
  );

  const { getSocketServer } = await import('../../sockets/socket.instance');
  const io = getSocketServer();
  io.to(`conversation:${conversationId}`).emit('message:new', systemMessage);

  return { success: true };
}

export async function validateConversationMembership(
  conversationId: string,
  userId: string
): Promise<boolean> {
  const member = await conversationsRepository.checkMembership(conversationId, userId);
  return !!member;
}

export async function toggleMute(conversationId: string, userId: string) {
  const member = await conversationsRepository.checkMembership(conversationId, userId);
  if (!member) throw new ApiError(404, 'Not a member of this conversation');

  const updated = await conversationsRepository.updateMemberState(conversationId, userId, {
    isMuted: !member.isMuted,
  });
  return { isMuted: updated.isMuted };
}

export async function toggleUnread(conversationId: string, userId: string) {
  const member = await conversationsRepository.checkMembership(conversationId, userId);
  if (!member) throw new ApiError(404, 'Not a member of this conversation');

  const updated = await conversationsRepository.updateMemberState(conversationId, userId, {
    isUnread: !member.isUnread,
  });
  return { isUnread: updated.isUnread };
}

export async function hideConversation(conversationId: string, userId: string) {
  const member = await conversationsRepository.checkMembership(conversationId, userId);
  if (!member) throw new ApiError(404, 'Not a member of this conversation');

  const updated = await conversationsRepository.updateMemberState(conversationId, userId, {
    isHidden: true,
  });
  return { isHidden: updated.isHidden };
}
