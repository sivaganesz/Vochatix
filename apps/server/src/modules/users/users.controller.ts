import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { getAllUsers, searchUsers, getUserById } from './users.service';
import { ApiError } from '../../utils/ApiError';

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await getAllUsers(req.user!.id);
  res.json({ success: true, data: { users } });
});

export const searchUsersHandler = asyncHandler(async (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  const users = await searchUsers(query, req.user!.id);
  res.json({ success: true, data: { users } });
});

export const getUserByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const user = await getUserById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ success: true, data: { user } });
});
