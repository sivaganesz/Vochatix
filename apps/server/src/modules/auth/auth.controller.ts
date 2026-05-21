import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { registerUser, loginUser, getCurrentUser } from './auth.service';
import { RegisterInput, LoginInput } from './auth.validation';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as RegisterInput;
  const result = await registerUser(input);
  res.status(201).json({ success: true, data: result });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as LoginInput;
  const result = await loginUser(input);
  res.json({ success: true, data: result });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await getCurrentUser(req.user!.id);
  res.json({ success: true, data: { user } });
});
