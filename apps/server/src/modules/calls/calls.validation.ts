import { z } from 'zod';

export const createCallSchema = z.object({
  conversationId: z.string().min(1),
  callType: z.enum(['AUDIO', 'VIDEO']),
  targetUserIds: z.array(z.string()).min(1),
});

export type CreateCallInput = z.infer<typeof createCallSchema>;

export const inviteUsersSchema = z.object({
  targetUserIds: z.array(z.string()).min(1),
});

export type InviteUsersInput = z.infer<typeof inviteUsersSchema>;
