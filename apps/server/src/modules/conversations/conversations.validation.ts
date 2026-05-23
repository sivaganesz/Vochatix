import { z } from 'zod';

export const createDirectConversationSchema = z.object({
  targetUserId: z.string().min(1, 'Target user ID is required'),
});

export type CreateDirectConversationInput = z.infer<typeof createDirectConversationSchema>;

export const createGroupConversationSchema = z.object({
  targetUserIds: z.array(z.string()).min(1, 'At least one target user is required'),
  name: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export type CreateGroupConversationInput = z.infer<typeof createGroupConversationSchema>;

export const updateGroupNameSchema = z.object({
  name: z.string().min(1, 'Group name cannot be empty'),
});

export type UpdateGroupNameInput = z.infer<typeof updateGroupNameSchema>;

export const addGroupMembersSchema = z.object({
  targetUserIds: z.array(z.string()).min(1, 'At least one target user is required'),
});

export type AddGroupMembersInput = z.infer<typeof addGroupMembersSchema>;
