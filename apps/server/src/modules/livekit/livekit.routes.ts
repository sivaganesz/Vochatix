import { Router } from 'express';
import { getLiveKitToken } from './livekit.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate.middleware';
import { generateTokenSchema } from './livekit.validation';

const router = Router();

router.use(authMiddleware);
router.post('/token', validateBody(generateTokenSchema), getLiveKitToken);

export default router;
