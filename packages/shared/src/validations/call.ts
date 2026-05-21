import { z } from 'zod';

export const createCallSchema = z.object({
  conversationId: z.string().min(1),
  callType: z.enum(['AUDIO', 'VIDEO']),
  targetUserIds: z.array(z.string().min(1)).min(1, 'At least one target user required'),
});

export const generateTokenSchema = z.object({
  callId: z.string().min(1, 'Call ID is required'),
});

export type CreateCallInput = z.infer<typeof createCallSchema>;
export type GenerateTokenInput = z.infer<typeof generateTokenSchema>;
