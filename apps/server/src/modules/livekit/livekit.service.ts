import { AccessToken } from 'livekit-server-sdk';
import { prisma } from '@vochatix/db';
import { ApiError } from '../../errors/ApiError';
import { env } from '@vochatix/config';

export async function generateLiveKitToken(callId: string, userId: string) {
  const call = await prisma.call.findUnique({
    where: { id: callId },
    include: { participants: true },
  });

  if (!call) throw new ApiError(404, 'Call not found');

  const isParticipant = call.participants.some((p) => p.userId === userId);
  if (!isParticipant) throw new ApiError(403, 'You are not a participant in this call');

  if (call.status !== 'ACCEPTED' && call.status !== 'RINGING') {
    throw new ApiError(400, 'Call is not active');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  const token = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
    identity: userId,
    name: user?.name ?? userId,
    ttl: '1h',
  });

  token.addGrant({
    roomJoin: true,
    room: call.roomName,
    canPublish: true,
    canSubscribe: true,
  });

  const jwt = await token.toJwt();

  return {
    token: jwt,
    url: env.LIVEKIT_URL,
    roomName: call.roomName,
  };
}
