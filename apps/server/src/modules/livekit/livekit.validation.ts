import { z } from 'zod';

export const generateTokenSchema = z.object({
  callId: z.string().min(1, 'Call ID is required'),
});

export type GenerateTokenInput = z.infer<typeof generateTokenSchema>;
