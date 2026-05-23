import { Router } from 'express';
import { 
  listConversations, 
  createDirect, 
  createGroup, 
  getConversation,
  updateGroup,
  addMembers,
  leaveGroup
} from './conversations.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate.middleware';
import { 
  createDirectConversationSchema, 
  createGroupConversationSchema,
  updateGroupNameSchema,
  addGroupMembersSchema
} from './conversations.validation';

const router = Router();

router.use(authMiddleware);
router.get('/', listConversations);
router.post('/direct', validateBody(createDirectConversationSchema), createDirect);
router.post('/group', validateBody(createGroupConversationSchema), createGroup);
router.get('/:conversationId', getConversation);
router.patch('/:conversationId', validateBody(updateGroupNameSchema), updateGroup);
router.post('/:conversationId/participants', validateBody(addGroupMembersSchema), addMembers);
router.delete('/:conversationId/participants/me', leaveGroup);

export default router;
