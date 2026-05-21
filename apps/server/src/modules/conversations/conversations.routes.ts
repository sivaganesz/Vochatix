import { Router } from 'express';
import { listConversations, createDirect, getConversation } from './conversations.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate.middleware';
import { createDirectConversationSchema } from './conversations.validation';

const router = Router();

router.use(authMiddleware);
router.get('/', listConversations);
router.post('/direct', validateBody(createDirectConversationSchema), createDirect);
router.get('/:conversationId', getConversation);

export default router;
