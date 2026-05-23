import { Prisma } from '@prisma/client';
import { prisma } from '@vochatix/db';

const callInclude = {
  participants: {
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  },
  startedBy: { select: { id: true, name: true, avatarUrl: true } },
  conversation: true,
};

export const callsRepository = {
  findConversationWithMembers(conversationId: string, memberId: string) {
    return prisma.conversation.findFirst({
      where: {
        id: conversationId,
        members: { some: { userId: memberId } },
      },
      include: { members: true },
    });
  },

  createCall(data: Prisma.CallUncheckedCreateInput, targetUserIds: string[]) {
    return prisma.call.create({
      data: {
        ...data,
        participants: {
          create: [data.startedById, ...targetUserIds].map((userId) => ({
            userId,
            status: 'RINGING',
          })),
        },
      },
      include: callInclude,
    });
  },

  findCallById(callId: string) {
    return prisma.call.findUnique({
      where: { id: callId },
      include: callInclude,
    });
  },

  findCallWithParticipant(callId: string, userId: string) {
    return prisma.call.findFirst({
      where: { id: callId, participants: { some: { userId } } },
      include: { participants: true },
    });
  },

  updateParticipantStatus(callId: string, userId: string, status: any, dateField: 'joinedAt' | 'leftAt' | null = null) {
    const data: any = { status };
    if (dateField) {
      data[dateField] = new Date();
    }
    return prisma.callParticipant.update({
      where: { callId_userId: { callId, userId } },
      data,
    });
  },

  updateCall(callId: string, data: any) {
    return prisma.call.update({
      where: { id: callId },
      data,
      include: callInclude,
    });
  },

  getCallParticipants(callId: string) {
    return prisma.callParticipant.findMany({
      where: { callId }
    });
  },

  updateManyParticipants(callId: string, whereStatus: any, data: any) {
    return prisma.callParticipant.updateMany({
      where: { callId, status: whereStatus },
      data,
    });
  },

  getCallOrThrow(callId: string) {
    return prisma.call.findUniqueOrThrow({
      where: { id: callId },
      include: callInclude,
    });
  },

  upsertConversationMember(conversationId: string, userId: string) {
    return prisma.conversationMember.upsert({
      where: {
        conversationId_userId: { conversationId, userId },
      },
      create: { conversationId, userId },
      update: {},
    });
  },

  addParticipants(callId: string, userIds: string[]) {
    return prisma.callParticipant.createMany({
      data: userIds.map(userId => ({
        callId,
        userId,
        status: 'RINGING',
      })),
    });
  }
};
