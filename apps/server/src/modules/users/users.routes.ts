import { Router } from 'express';
import { getUsers, searchUsersHandler, getUserByIdHandler, updateUserHandler } from './users.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/', getUsers);
router.get('/search', searchUsersHandler);
router.patch('/me', updateUserHandler);
router.get('/:userId', getUserByIdHandler);

export default router;
