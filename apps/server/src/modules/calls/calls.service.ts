import { callsRepository } from './calls.repository';
import { ApiError } from '../../errors/ApiError';
import { createCallRoomName } from '@vochatix/utils';
import { formatCallDuration } from '@vochatix/utils';
import { createSystemMessage } from '../messages/messages.service';
import { CallType } from '@prisma/client';

export async function createCall(
  conversationId: string,
  startedById: string,
  callType: CallType,
  targetUserIds: string[]
) {
  // Validate conversation exists and caller is member
  const conversation = await callsRepository.findConversationWithMembers(conversationId, startedById);

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

  const call = await callsRepository.createCall({ conversationId, roomName, callType, startedById }, targetUserIds);

  // Create system message
  const callTypeLabel = callType === 'VIDEO' ? 'Video' : 'Audio';
  const message = await createSystemMessage(conversationId, `${callTypeLabel} call started`, {
    callId: call.id,
    callType,
    status: 'RINGING',
  }, 'SEEN');

  return { call, message };
}

export async function getCallById(callId: string) {
  return callsRepository.findCallById(callId);
}

export async function acceptCall(callId: string, userId: string) {
  const call = await callsRepository.findCallWithParticipant(callId, userId);

  if (!call) throw new ApiError(404, 'Call not found or access denied');
  
  const participant = call.participants.find(p => p.userId === userId);
  if (!participant || participant.status !== 'RINGING') {
    throw new ApiError(400, 'You are not ringing for this call');
  }

  await callsRepository.updateParticipantStatus(callId, userId, 'ACCEPTED', 'joinedAt');

  const updatedCall = await callsRepository.updateCall(callId, { status: 'ACCEPTED', ...(call.status === 'RINGING' ? { startedAt: new Date() } : {}) });

  return updatedCall;
}

export async function rejectCall(callId: string, userId: string) {
  const call = await callsRepository.findCallWithParticipant(callId, userId);

  if (!call) throw new ApiError(404, 'Call not found');

  await callsRepository.updateParticipantStatus(callId, userId, 'REJECTED', 'leftAt');

  const updatedParticipants = await callsRepository.getCallParticipants(callId);

  const isCallActive = call.status === 'ACCEPTED';
  
  // Check if any other targets (not the caller) are still RINGING or ACCEPTED
  const callerId = call.startedById;
  const otherTargets = updatedParticipants.filter(p => p.userId !== callerId);
  const hasActiveOrRingingTargets = otherTargets.some(p => p.status === 'ACCEPTED' || p.status === 'RINGING');

  const shouldRejectCall = !isCallActive && !hasActiveOrRingingTargets;

  const updatedCall = await callsRepository.updateCall(callId, shouldRejectCall ? { status: 'REJECTED', endedAt: new Date() } : {});

  const callTypeLabel = call.callType === 'VIDEO' ? 'Video' : 'Audio';
  let message = null;
  
  if (shouldRejectCall) {
    message = await createSystemMessage(call.conversationId, `${callTypeLabel} call declined`, {
      callId,
      callType: call.callType,
      status: 'REJECTED',
    }, 'SEEN');
  }

  return { call: updatedCall, message, shouldRejectCall };
}

export async function endCall(callId: string, userId: string) {
  const call = await callsRepository.findCallWithParticipant(callId, userId);

  if (!call) throw new ApiError(404, 'Call not found');

  await callsRepository.updateParticipantStatus(callId, userId, 'LEFT', 'leftAt');

  // Count accepted participants still in the call (excluding the user who just left)
  const remainingAccepted = call.participants.filter(
    (p) => p.userId !== userId && p.status === 'ACCEPTED'
  );

  const hasAcceptedParticipants = remainingAccepted.length > 0;

  // End the entire call when:
  // 1. No one accepted remains (0 accepted left after this user leaves), OR
  // 2. Only 1 accepted user would remain — a call needs ≥2 active participants to continue
  //    (covers Case 1: direct call with 2 people, Case 2: group call drops to 2 then one leaves)
  // 3. The caller leaves before anyone accepted (unanswered call)
  const remainingActiveCount = remainingAccepted.length;
  const shouldEndCall =
    remainingActiveCount <= 1 ||
    (!hasAcceptedParticipants && userId === call.startedById);
  const endedAt = new Date();

  let updatedCall;
  if (shouldEndCall) {
    // Mark any remaining ringing users as MISSED
    await callsRepository.updateManyParticipants(callId, 'RINGING', { status: 'MISSED', leftAt: endedAt });

    const wasEverAccepted = call.status === 'ACCEPTED';
    const finalStatus = wasEverAccepted ? 'ENDED' : 'MISSED';

    updatedCall = await callsRepository.updateCall(callId, { status: finalStatus, endedAt });
  } else {
    updatedCall = await callsRepository.getCallOrThrow(callId);
  }

  const callTypeLabel = call.callType === 'VIDEO' ? 'Video' : 'Audio';
  let durationText = '';
  if (call.startedAt) {
    durationText = ` · ${formatCallDuration(call.startedAt, endedAt)}`;
  }

  let message = null;
  if (shouldEndCall) {
    if (updatedCall.status === 'MISSED') {
      message = await createSystemMessage(call.conversationId, `Missed ${callTypeLabel.toLowerCase()} call`, {
        callId,
        callType: call.callType,
        status: 'MISSED',
      }, 'SENT');
    } else {
      message = await createSystemMessage(call.conversationId, `${callTypeLabel} call ended${durationText}`, {
        callId,
        callType: call.callType,
        status: 'ENDED',
        duration: call.startedAt
          ? Math.floor((endedAt.getTime() - call.startedAt.getTime()) / 1000)
          : 0,
      }, 'SEEN');
    }
  }

  return { call: updatedCall, message, shouldEndCall };
}

export async function markCallAsMissed(callId: string) {
  const call = await callsRepository.findCallWithParticipant(callId, undefined as any) /* manually fix this one */;

  if (!call || call.status !== 'RINGING') return null;

  await callsRepository.updateManyParticipants(callId, 'RINGING', { status: 'MISSED', leftAt: new Date() });

  const updatedCall = await callsRepository.updateCall(callId, { status: 'MISSED', endedAt: new Date() });

  const callTypeLabel = call.callType === 'VIDEO' ? 'Video' : 'Audio';
  const message = await createSystemMessage(call.conversationId, `Missed ${callTypeLabel.toLowerCase()} call`, {
    callId,
    callType: call.callType,
    status: 'MISSED',
  });

  return { call: updatedCall, message };
}

export async function inviteToCall(callId: string, inviterId: string, targetUserIds: string[]) {
  const call = await callsRepository.findCallById(callId) /* returns more than needed but fine */;

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
    await callsRepository.upsertConversationMember(call.conversationId, targetId);
  }

  // Create new ringing participants
  await callsRepository.addParticipants(callId, newTargetIds);

  const updatedCall = await callsRepository.getCallOrThrow(callId);

  const inviter = updatedCall.participants.find(p => p.userId === inviterId)?.user;

  return { call: updatedCall, invitedUserIds: newTargetIds, inviter };
}

