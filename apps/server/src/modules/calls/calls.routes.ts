import { Router } from 'express';
import {
  initiateCall,
  getCall,
  acceptCallHandler,
  rejectCallHandler,
  endCallHandler,
  inviteUsersHandler,
  getCallHistory,
  removeFromView,
} from './calls.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate.middleware';
import { createCallSchema, inviteUsersSchema } from './calls.validation';

const router = Router();

router.use(authMiddleware);
router.get('/history', getCallHistory);
router.post('/', validateBody(createCallSchema), initiateCall);
router.get('/:callId', getCall);
router.patch('/:callId/remove-from-view', removeFromView);
router.post('/:callId/accept', acceptCallHandler);
router.post('/:callId/reject', rejectCallHandler);
router.post('/:callId/end', endCallHandler);
router.post('/:callId/invite', validateBody(inviteUsersSchema), inviteUsersHandler);

export default router;
