import { prisma } from '../../prisma/prisma.service';
import { ApiError } from '../../utils/ApiError';
import { createCallRoomName } from '../../utils/room-name';
import { formatCallDuration } from '../../utils/date';
import { createSystemMessage } from '../messages/messages.service';
import { CallType } from '@prisma/client';

export async function createCall(
  conversationId: string,
  startedById: string,
  callType: CallType,
  targetUserIds: string[]
) {
  // Validate conversation exists and caller is member
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      members: { some: { userId: startedById } },
    },
    include: { members: true },
  });

  if (!conversation) throw new ApiError(403, 'Conversation not found or access denied');

  // Validate all target users are members
  for (const targetId of targetUserIds) {
    const isMember = conversation.members.some((m) => m.userId === targetId);
    if (!isMember)
      throw new ApiError(400, `User ${targetId} is not a member of this conversation`);
  }

  const roomName = createCallRoomName(conversationId);
  const allParticipantIds = [startedById, ...targetUserIds];

  const call = await prisma.call.create({
    data: {
      conversationId,
      roomName,
      callType,
      startedById,
      participants: {
        create: allParticipantIds.map((userId) => ({
          userId,
          status: 'RINGING',
        })),
      },
    },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      },
      startedBy: { select: { id: true, name: true, avatarUrl: true } },
      conversation: true,
    },
  });

  // Create system message
  const callTypeLabel = callType === 'VIDEO' ? 'Video' : 'Audio';
  await createSystemMessage(conversationId, `${callTypeLabel} call started`, {
    callId: call.id,
    callType,
    status: 'RINGING',
  });

  return call;
}

export async function getCallById(callId: string) {
  return prisma.call.findUnique({
    where: { id: callId },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      },
      startedBy: { select: { id: true, name: true, avatarUrl: true } },
      conversation: true,
    },
  });
}

export async function acceptCall(callId: string, userId: string) {
  const call = await prisma.call.findFirst({
    where: { id: callId, participants: { some: { userId } } },
    include: { participants: true },
  });

  if (!call) throw new ApiError(404, 'Call not found or access denied');
  if (call.status !== 'RINGING') throw new ApiError(400, 'Call is no longer ringing');

  await prisma.callParticipant.update({
    where: { callId_userId: { callId, userId } },
    data: { status: 'ACCEPTED', joinedAt: new Date() },
  });

  const updatedCall = await prisma.call.update({
    where: { id: callId },
    data: { status: 'ACCEPTED', startedAt: new Date() },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      },
      startedBy: { select: { id: true, name: true, avatarUrl: true } },
      conversation: true,
    },
  });

  return updatedCall;
}

export async function rejectCall(callId: string, userId: string) {
  const call = await prisma.call.findFirst({
    where: { id: callId, participants: { some: { userId } } },
  });

  if (!call) throw new ApiError(404, 'Call not found');

  await prisma.callParticipant.update({
    where: { callId_userId: { callId, userId } },
    data: { status: 'REJECTED', leftAt: new Date() },
  });

  const updatedCall = await prisma.call.update({
    where: { id: callId },
    data: { status: 'REJECTED', endedAt: new Date() },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      },
      startedBy: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  const callTypeLabel = call.callType === 'VIDEO' ? 'Video' : 'Audio';
  await createSystemMessage(call.conversationId, `${callTypeLabel} call declined`, {
    callId,
    callType: call.callType,
    status: 'REJECTED',
  });

  return updatedCall;
}

export async function endCall(callId: string, userId: string) {
  const call = await prisma.call.findFirst({
    where: { id: callId, participants: { some: { userId } } },
    include: { participants: true },
  });

  if (!call) throw new ApiError(404, 'Call not found');

  await prisma.callParticipant.update({
    where: { callId_userId: { callId, userId } },
    data: { status: 'LEFT', leftAt: new Date() },
  });

  const endedAt = new Date();
  const updatedCall = await prisma.call.update({
    where: { id: callId },
    data: { status: 'ENDED', endedAt },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      },
      startedBy: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  const callTypeLabel = call.callType === 'VIDEO' ? 'Video' : 'Audio';
  let durationText = '';
  if (call.startedAt) {
    durationText = ` · ${formatCallDuration(call.startedAt, endedAt)}`;
  }

  await createSystemMessage(call.conversationId, `${callTypeLabel} call ended${durationText}`, {
    callId,
    callType: call.callType,
    status: 'ENDED',
    duration: call.startedAt
      ? Math.floor((endedAt.getTime() - call.startedAt.getTime()) / 1000)
      : 0,
  });

  return updatedCall;
}

export async function markCallAsMissed(callId: string) {
  const call = await prisma.call.findUnique({
    where: { id: callId },
    include: { participants: true },
  });

  if (!call || call.status !== 'RINGING') return null;

  await prisma.callParticipant.updateMany({
    where: { callId, status: 'RINGING' },
    data: { status: 'MISSED', leftAt: new Date() },
  });

  const updatedCall = await prisma.call.update({
    where: { id: callId },
    data: { status: 'MISSED', endedAt: new Date() },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      },
      startedBy: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  const callTypeLabel = call.callType === 'VIDEO' ? 'Video' : 'Audio';
  await createSystemMessage(call.conversationId, `Missed ${callTypeLabel.toLowerCase()} call`, {
    callId,
    callType: call.callType,
    status: 'MISSED',
  });

  return updatedCall;
}
