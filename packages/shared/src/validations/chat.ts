import { z } from 'zod';

export const sendMessageSchema = z.object({
  text: z.string().min(1, 'Message cannot be empty').max(4000, 'Message too long'),
});

export const createDirectConversationSchema = z.object({
  targetUserId: z.string().min(1, 'Target user is required'),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateDirectConversationInput = z.infer<typeof createDirectConversationSchema>;
