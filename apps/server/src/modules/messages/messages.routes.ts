import { Router } from 'express';
import { listMessages, createMessage, markRead } from './messages.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate.middleware';
import { sendMessageSchema } from './messages.validation';

const router = Router({ mergeParams: true });

router.use(authMiddleware);
router.get('/', listMessages);
router.post('/', validateBody(sendMessageSchema), createMessage);
router.post('/read', markRead);

export default router;
