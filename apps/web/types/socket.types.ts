export const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',

  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',

  MESSAGE_SEND: 'message:send',
  MESSAGE_NEW: 'message:new',
  MESSAGE_DELIVERED: 'message:delivered',
  MESSAGE_SEEN: 'message:seen',

  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',

  CALL_INVITE: 'call:invite',
  CALL_INCOMING: 'call:incoming',
  CALL_ACCEPT: 'call:accept',
  CALL_ACCEPTED: 'call:accepted',
  CALL_REJECT: 'call:reject',
  CALL_REJECTED: 'call:rejected',
  CALL_END: 'call:end',
  CALL_ENDED: 'call:ended',
  CALL_MISSED: 'call:missed',
  CALL_BUSY: 'call:busy',
  CALL_ERROR: 'call:error',
} as const;
