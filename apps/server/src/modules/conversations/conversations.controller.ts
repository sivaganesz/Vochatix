import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import {
  getConversations,
  createDirectConversation,
  getConversationById,
} from './conversations.service';
import { CreateDirectConversationInput } from './conversations.validation';

export const listConversations = asyncHandler(async (req: Request, res: Response) => {
  const conversations = await getConversations(req.user!.id);
  res.json({ success: true, data: { conversations } });
});

export const createDirect = asyncHandler(async (req: Request, res: Response) => {
  const { targetUserId } = req.body as CreateDirectConversationInput;
  const conversation = await createDirectConversation(req.user!.id, targetUserId);
  res.status(201).json({ success: true, data: { conversation } });
});

export const getConversation = asyncHandler(async (req: Request, res: Response) => {
  const conversation = await getConversationById(req.params.conversationId, req.user!.id);
  res.json({ success: true, data: { conversation } });
});
