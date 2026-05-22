import { Server } from 'socket.io';
import {
  AuthenticatedSocket,
  CallInvitePayload,
  CallAcceptPayload,
  CallRejectPayload,
  CallEndPayload,
  CallInviteParticipantsPayload,
} from '../../types/socket.types';
import { SOCKET_EVENTS } from './socket.events';
import { createCall, acceptCall, rejectCall, endCall, markCallAsMissed, inviteToCall } from '../calls/calls.service';
import { logger } from '../../utils/logger';
import { CallType } from '@prisma/client';

// Track missed-call timeouts
const callTimeouts = new Map<string, NodeJS.Timeout>();

const MISSED_CALL_TIMEOUT_MS = 45_000;

export function handleCallEvents(io: Server, socket: AuthenticatedSocket): void {
  const { userId } = socket;

  // User A initiates a call
  socket.on(SOCKET_EVENTS.CALL_INVITE, async (payload: CallInvitePayload) => {
    try {
      const { conversationId, callType, targetUserIds } = payload;

      const { call, message } = await createCall(
        conversationId,
        userId,
        callType as CallType,
        targetUserIds
      );

      // Broadcast the "Call started" system message to the conversation
      io.to(`conversation:${conversationId}`).emit(SOCKET_EVENTS.MESSAGE_NEW, { message });

      // Notify caller that call was created (broadcasting to their user room to ensure it reaches them)
      io.to(`user:${userId}`).emit(SOCKET_EVENTS.CALL_INCOMING, { call, isCaller: true });

      // Notify each target user
      for (const targetId of targetUserIds) {
        io.to(`user:${targetId}`).emit(SOCKET_EVENTS.CALL_INCOMING, {
          call,
          isCaller: false,
        });
      }

      // Set timeout for missed call
      const timeout = setTimeout(async () => {
        try {
          const result = await markCallAsMissed(call.id);
          if (result) {
            const { call: updatedCall, message } = result;
            // Notify all participants
            for (const participant of updatedCall.participants) {
              io.to(`user:${participant.userId}`).emit(SOCKET_EVENTS.CALL_MISSED, {
                call: updatedCall,
              });
            }
            // Broadcast the missed call system message
            io.to(`conversation:${updatedCall.conversationId}`).emit(SOCKET_EVENTS.MESSAGE_NEW, { message });
          }
        } catch (err) {
          logger.error('Error marking call as missed:', err);
        } finally {
          callTimeouts.delete(call.id);
        }
      }, MISSED_CALL_TIMEOUT_MS);

      callTimeouts.set(call.id, timeout);

      logger.info(`Call ${call.id} initiated by user ${userId}`);
    } catch (error) {
      socket.emit(SOCKET_EVENTS.CALL_ERROR, { message: 'Failed to initiate call' });
      logger.error('Error initiating call:', error);
    }
  });

  // Invite more participants to an ongoing call
  socket.on(SOCKET_EVENTS.CALL_INVITE_PARTICIPANTS, async (payload: CallInviteParticipantsPayload) => {
    try {
      const { callId, targetUserIds } = payload;
      const { call, invitedUserIds } = await inviteToCall(callId, userId, targetUserIds);

      // Notify each newly invited user
      for (const targetId of invitedUserIds) {
        io.to(`user:${targetId}`).emit(SOCKET_EVENTS.CALL_PARTICIPANT_INCOMING, {
          call,
          isCaller: false,
        });
      }

      logger.info(`Users ${invitedUserIds.join(', ')} invited to call ${callId} by user ${userId}`);
    } catch (error) {
      socket.emit(SOCKET_EVENTS.CALL_ERROR, { message: 'Failed to invite participants' });
      logger.error('Error inviting participants:', error);
    }
  });

  // User B accepts the call
  socket.on(SOCKET_EVENTS.CALL_ACCEPT, async (payload: CallAcceptPayload) => {
    try {
      const { callId } = payload;

      // Cancel missed-call timeout
      const timeout = callTimeouts.get(callId);
      if (timeout) {
        clearTimeout(timeout);
        callTimeouts.delete(callId);
      }

      const call = await acceptCall(callId, userId);

      // Notify all participants
      for (const participant of call.participants) {
        io.to(`user:${participant.userId}`).emit(SOCKET_EVENTS.CALL_ACCEPTED, { call });
      }

      logger.info(`Call ${callId} accepted by user ${userId}`);
    } catch (error) {
      socket.emit(SOCKET_EVENTS.CALL_ERROR, { message: 'Failed to accept call' });
      logger.error('Error accepting call:', error);
    }
  });

  // User B rejects the call
  socket.on(SOCKET_EVENTS.CALL_REJECT, async (payload: CallRejectPayload) => {
    try {
      const { callId } = payload;

      // Cancel missed-call timeout
      const timeout = callTimeouts.get(callId);
      if (timeout) {
        clearTimeout(timeout);
        callTimeouts.delete(callId);
      }

      const { call, message } = await rejectCall(callId, userId);

      // Notify all participants
      for (const participant of call.participants) {
        io.to(`user:${participant.userId}`).emit(SOCKET_EVENTS.CALL_REJECTED, { call });
      }

      // Broadcast the declined call system message
      io.to(`conversation:${call.conversationId}`).emit(SOCKET_EVENTS.MESSAGE_NEW, { message });

      logger.info(`Call ${callId} rejected by user ${userId}`);
    } catch (error) {
      socket.emit(SOCKET_EVENTS.CALL_ERROR, { message: 'Failed to reject call' });
      logger.error('Error rejecting call:', error);
    }
  });

  // A participant ends the call
  socket.on(SOCKET_EVENTS.CALL_END, async (payload: CallEndPayload) => {
    try {
      const { callId } = payload;

      // Cancel missed-call timeout if still pending
      const timeout = callTimeouts.get(callId);
      if (timeout) {
        clearTimeout(timeout);
        callTimeouts.delete(callId);
      }

      const { call, message } = await endCall(callId, userId);

      // Notify all participants
      for (const participant of call.participants) {
        io.to(`user:${participant.userId}`).emit(SOCKET_EVENTS.CALL_ENDED, { call });
      }

      // Broadcast the ended call system message
      io.to(`conversation:${call.conversationId}`).emit(SOCKET_EVENTS.MESSAGE_NEW, { message });

      logger.info(`Call ${callId} ended by user ${userId}`);
    } catch (error) {
      socket.emit(SOCKET_EVENTS.CALL_ERROR, { message: 'Failed to end call' });
      logger.error('Error ending call:', error);
    }
  });
}
