export type CallType = 'AUDIO' | 'VIDEO';
export type CallStatus = 'RINGING' | 'ACCEPTED' | 'REJECTED' | 'MISSED' | 'ENDED' | 'FAILED';
export type CallParticipantStatus = 'RINGING' | 'ACCEPTED' | 'REJECTED' | 'MISSED' | 'LEFT';

export interface CallParticipant {
  id: string;
  callId: string;
  userId: string;
  status: CallParticipantStatus;
  joinedAt: string | null;
  leftAt: string | null;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface Call {
  id: string;
  conversationId: string;
  roomName: string;
  callType: CallType;
  status: CallStatus;
  startedById: string;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
  participants: CallParticipant[];
  startedBy: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface IncomingCallState {
  call: Call;
  isCaller: boolean;
  inviter?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}
