import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import {
  getConversations,
  createDirectConversation,
  createGroupConversation,
  getConversationById,
  updateGroupName,
  addGroupMembers,
  leaveGroup as leaveGroupService,
} from './conversations.service';
import { 
  CreateDirectConversationInput, 
  CreateGroupConversationInput,
  UpdateGroupNameInput,
  AddGroupMembersInput
} from './conversations.validation';
import { getSocketServer } from '../sockets/socket.instance';

export const listConversations = asyncHandler(async (req: Request, res: Response) => {
  const conversations = await getConversations(req.user!.id);
  res.json({ success: true, data: { conversations } });
});

export const createDirect = asyncHandler(async (req: Request, res: Response) => {
  const { targetUserId } = req.body as CreateDirectConversationInput;
  const conversation = await createDirectConversation(req.user!.id, targetUserId);
  res.status(201).json({ success: true, data: { conversation } });
});

export const createGroup = asyncHandler(async (req: Request, res: Response) => {
  const { targetUserIds, name, avatarUrl } = req.body as CreateGroupConversationInput;
  const conversation = await createGroupConversation(req.user!.id, targetUserIds, name, avatarUrl);
  res.status(201).json({ success: true, data: { conversation } });
});

export const updateGroup = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body as UpdateGroupNameInput;
  const conversation = await updateGroupName(req.params.conversationId, req.user!.id, name);
  
  const io = getSocketServer();
  io.to(`conversation:${conversation.id}`).emit('conversation:updated', conversation);
  
  res.json({ success: true, data: { conversation } });
});

export const addMembers = asyncHandler(async (req: Request, res: Response) => {
  const { targetUserIds } = req.body as AddGroupMembersInput;
  const conversation = await addGroupMembers(req.params.conversationId, req.user!.id, targetUserIds);
  
  if (conversation) {
    const io = getSocketServer();
    io.to(`conversation:${conversation.id}`).emit('conversation:updated', conversation);
  }
  
  res.json({ success: true, data: { conversation } });
});

export const leaveGroup = asyncHandler(async (req: Request, res: Response) => {
  await leaveGroupService(req.params.conversationId, req.user!.id);
  
  const io = getSocketServer();
  io.to(`conversation:${req.params.conversationId}`).emit('conversation:updated', { id: req.params.conversationId });
  
  res.json({ success: true });
});

export const getConversation = asyncHandler(async (req: Request, res: Response) => {
  const conversation = await getConversationById(req.params.conversationId, req.user!.id);
  res.json({ success: true, data: { conversation } });
});
