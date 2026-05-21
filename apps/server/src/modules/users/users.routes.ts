import { Router } from 'express';
import { getUsers, searchUsersHandler, getUserByIdHandler } from './users.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/', getUsers);
router.get('/search', searchUsersHandler);
router.get('/:userId', getUserByIdHandler);

export default router;
