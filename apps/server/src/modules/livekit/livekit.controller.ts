import { Request, Response } from 'express';
import { asyncHandler } from '../../core/asyncHandler';
import { generateLiveKitToken } from './livekit.service';
import { GenerateTokenInput } from './livekit.validation';

export const getLiveKitToken = asyncHandler(async (req: Request, res: Response) => {
  const { callId } = req.body as GenerateTokenInput;
  const result = await generateLiveKitToken(callId, req.user!.id);
  res.json({ success: true, data: result });
});
