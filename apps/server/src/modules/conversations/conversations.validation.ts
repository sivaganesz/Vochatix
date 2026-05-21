import { z } from 'zod';

export const createDirectConversationSchema = z.object({
  targetUserId: z.string().min(1, 'Target user ID is required'),
});

export type CreateDirectConversationInput = z.infer<typeof createDirectConversationSchema>;
