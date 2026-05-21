import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { createCall, getCallById, acceptCall, rejectCall, endCall } from './calls.service';
import { ApiError } from '../../utils/ApiError';
import { CallType } from '@prisma/client';

export const initiateCall = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId, callType, targetUserIds } = req.body;
  const call = await createCall(
    conversationId,
    req.user!.id,
    callType as CallType,
    targetUserIds
  );
  res.status(201).json({ success: true, data: { call } });
});

export const getCall = asyncHandler(async (req: Request, res: Response) => {
  const call = await getCallById(req.params.callId);
  if (!call) throw new ApiError(404, 'Call not found');
  res.json({ success: true, data: { call } });
});

export const acceptCallHandler = asyncHandler(async (req: Request, res: Response) => {
  const call = await acceptCall(req.params.callId, req.user!.id);
  res.json({ success: true, data: { call } });
});

export const rejectCallHandler = asyncHandler(async (req: Request, res: Response) => {
  const call = await rejectCall(req.params.callId, req.user!.id);
  res.json({ success: true, data: { call } });
});

export const endCallHandler = asyncHandler(async (req: Request, res: Response) => {
  const call = await endCall(req.params.callId, req.user!.id);
  res.json({ success: true, data: { call } });
});
