import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  userId: string;
  userEmail: string;
}

export interface CallInvitePayload {
  conversationId: string;
  callType: 'AUDIO' | 'VIDEO';
  targetUserIds: string[];
}

export interface CallAcceptPayload {
  callId: string;
}

export interface CallRejectPayload {
  callId: string;
}

export interface CallEndPayload {
  callId: string;
}

export interface MessageSendPayload {
  conversationId: string;
  text: string;
}

export interface TypingPayload {
  conversationId: string;
}

export interface CallInviteParticipantsPayload {
  callId: string;
  targetUserIds: string[];
}

export interface CallParticipantLeftPayload {
  call: any; // We can use the actual Call type here
  leftUserId: string;
}
