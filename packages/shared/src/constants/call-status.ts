export type CallStatus = 'RINGING' | 'ACCEPTED' | 'REJECTED' | 'MISSED' | 'ENDED' | 'FAILED';
export type CallParticipantStatus = 'RINGING' | 'ACCEPTED' | 'REJECTED' | 'MISSED' | 'LEFT';

export const CALL_STATUS = {
  RINGING: 'RINGING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  MISSED: 'MISSED',
  ENDED: 'ENDED',
  FAILED: 'FAILED',
} as const;

export const CALL_PARTICIPANT_STATUS = {
  RINGING: 'RINGING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  MISSED: 'MISSED',
  LEFT: 'LEFT',
} as const;
