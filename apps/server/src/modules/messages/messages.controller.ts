import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { getMessages, sendMessage, markMessagesAsRead } from './messages.service';
import { SendMessageInput } from './messages.validation';

export const listMessages = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const messages = await getMessages(conversationId, req.user!.id);
  res.json({ success: true, data: { messages } });
});

export const createMessage = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const { text } = req.body as SendMessageInput;
  const message = await sendMessage(conversationId, req.user!.id, text);
  res.status(201).json({ success: true, data: { message } });
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const count = await markMessagesAsRead(conversationId, req.user!.id);
  res.json({ success: true, data: { count } });
});
