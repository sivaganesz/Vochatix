import { Server } from 'socket.io';
import {
  AuthenticatedSocket,
  CallInvitePayload,
  CallAcceptPayload,
  CallRejectPayload,
  CallEndPayload,
} from '../../types/socket.types';
import { SOCKET_EVENTS } from './socket.events';
import { createCall, acceptCall, rejectCall, endCall, markCallAsMissed } from '../calls/calls.service';
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

      const call = await createCall(
        conversationId,
        userId,
        callType as CallType,
        targetUserIds
      );

      // Notify caller that call was created
      socket.emit(SOCKET_EVENTS.CALL_INCOMING, { call, isCaller: true });

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
          const updatedCall = await markCallAsMissed(call.id);
          if (updatedCall) {
            // Notify all participants
            for (const participant of call.participants) {
              io.to(`user:${participant.userId}`).emit(SOCKET_EVENTS.CALL_MISSED, {
                call: updatedCall,
              });
            }
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

      const call = await rejectCall(callId, userId);

      // Notify all participants
      for (const participant of call.participants) {
        io.to(`user:${participant.userId}`).emit(SOCKET_EVENTS.CALL_REJECTED, { call });
      }

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

      const call = await endCall(callId, userId);

      // Notify all participants
      for (const participant of call.participants) {
        io.to(`user:${participant.userId}`).emit(SOCKET_EVENTS.CALL_ENDED, { call });
      }

      logger.info(`Call ${callId} ended by user ${userId}`);
    } catch (error) {
      socket.emit(SOCKET_EVENTS.CALL_ERROR, { message: 'Failed to end call' });
      logger.error('Error ending call:', error);
    }
  });
}
