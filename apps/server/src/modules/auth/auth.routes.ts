import { Router } from 'express';
import { register, login, me } from './auth.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate.middleware';
import { registerSchema, loginSchema } from './auth.validation';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.get('/me', authMiddleware, me);

export default router;
