import { Router } from 'express';
import {
  initiateCall,
  getCall,
  acceptCallHandler,
  rejectCallHandler,
  endCallHandler,
} from './calls.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate.middleware';
import { createCallSchema } from './calls.validation';

const router = Router();

router.use(authMiddleware);
router.post('/', validateBody(createCallSchema), initiateCall);
router.get('/:callId', getCall);
router.post('/:callId/accept', acceptCallHandler);
router.post('/:callId/reject', rejectCallHandler);
router.post('/:callId/end', endCallHandler);

export default router;
