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

  // Prevent calling yourself
  if (targetUserIds.includes(startedById)) {
    throw new ApiError(400, 'You cannot call yourself');
  }

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
  const message = await createSystemMessage(conversationId, `${callTypeLabel} call started`, {
    callId: call.id,
    callType,
    status: 'RINGING',
  });

  return { call, message };
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
  
  const participant = call.participants.find(p => p.userId === userId);
  if (!participant || participant.status !== 'RINGING') {
    throw new ApiError(400, 'You are not ringing for this call');
  }

  await prisma.callParticipant.update({
    where: { callId_userId: { callId, userId } },
    data: { status: 'ACCEPTED', joinedAt: new Date() },
  });

  const updatedCall = await prisma.call.update({
    where: { id: callId },
    data: {
      status: 'ACCEPTED',
      ...(call.status === 'RINGING' ? { startedAt: new Date() } : {}),
    },
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

  const isCallActive = call.status === 'ACCEPTED';
  const updatedCall = await prisma.call.update({
    where: { id: callId },
    data: isCallActive 
      ? {} // Do not change call status if it's already active
      : { status: 'REJECTED', endedAt: new Date() },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      },
      startedBy: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  const callTypeLabel = call.callType === 'VIDEO' ? 'Video' : 'Audio';
  let message;
  
  if (!isCallActive) {
    message = await createSystemMessage(call.conversationId, `${callTypeLabel} call declined`, {
      callId,
      callType: call.callType,
      status: 'REJECTED',
    });
  }

  return { call: updatedCall, message };
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

  const remainingParticipants = call.participants.filter(
    (p) => p.userId !== userId && (p.status === 'ACCEPTED' || p.status === 'RINGING')
  );

  const hasAcceptedParticipants = call.participants.some(
    (p) => p.userId !== userId && p.status === 'ACCEPTED'
  );

  // End the call if no one is left, or if the caller leaves before anyone has accepted
  const shouldEndCall = remainingParticipants.length === 0 || (!hasAcceptedParticipants && userId === call.startedById);
  const endedAt = new Date();

  let updatedCall;
  if (shouldEndCall) {
    updatedCall = await prisma.call.update({
      where: { id: callId },
      data: { status: 'ENDED', endedAt },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        },
        startedBy: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  } else {
    updatedCall = await prisma.call.findUniqueOrThrow({
      where: { id: callId },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        },
        startedBy: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  }

  const callTypeLabel = call.callType === 'VIDEO' ? 'Video' : 'Audio';
  let durationText = '';
  if (call.startedAt) {
    durationText = ` · ${formatCallDuration(call.startedAt, endedAt)}`;
  }

  let message = null;
  if (shouldEndCall) {
    message = await createSystemMessage(call.conversationId, `${callTypeLabel} call ended${durationText}`, {
      callId,
      callType: call.callType,
      status: 'ENDED',
      duration: call.startedAt
        ? Math.floor((endedAt.getTime() - call.startedAt.getTime()) / 1000)
        : 0,
    });
  }

  return { call: updatedCall, message, shouldEndCall };
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
  const message = await createSystemMessage(call.conversationId, `Missed ${callTypeLabel.toLowerCase()} call`, {
    callId,
    callType: call.callType,
    status: 'MISSED',
  });

  return { call: updatedCall, message };
}

export async function inviteToCall(callId: string, inviterId: string, targetUserIds: string[]) {
  const call = await prisma.call.findUnique({
    where: { id: callId },
    include: { participants: true, conversation: true },
  });

  if (!call) throw new ApiError(404, 'Call not found');
  if (call.status !== 'RINGING' && call.status !== 'ACCEPTED') {
    throw new ApiError(400, 'Call is no longer active');
  }

  // Ensure inviter is in the call
  const isInviterParticipant = call.participants.some(p => p.userId === inviterId);
  if (!isInviterParticipant) {
    throw new ApiError(403, 'You are not a participant in this call');
  }

  // Filter out existing participants
  const existingParticipantIds = new Set(call.participants.map(p => p.userId));
  const newTargetIds = targetUserIds.filter(id => !existingParticipantIds.has(id));

  if (newTargetIds.length === 0) {
    throw new ApiError(400, 'All selected users are already in the call');
  }

  // Ensure new targets are conversation members
  for (const targetId of newTargetIds) {
    await prisma.conversationMember.upsert({
      where: {
        conversationId_userId: {
          conversationId: call.conversationId,
          userId: targetId,
        },
      },
      create: {
        conversationId: call.conversationId,
        userId: targetId,
      },
      update: {}, // Do nothing if exists
    });
  }

  // Create new ringing participants
  await prisma.callParticipant.createMany({
    data: newTargetIds.map(userId => ({
      callId,
      userId,
      status: 'RINGING',
    })),
  });

  const updatedCall = await prisma.call.findUniqueOrThrow({
    where: { id: callId },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      },
      startedBy: { select: { id: true, name: true, avatarUrl: true } },
      conversation: true,
    },
  });

  const inviter = updatedCall.participants.find(p => p.userId === inviterId)?.user;

  return { call: updatedCall, invitedUserIds: newTargetIds, inviter };
}
