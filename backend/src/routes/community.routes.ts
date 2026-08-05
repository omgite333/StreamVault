import { Router } from 'express';
import * as communityController from '../controllers/community.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createMessageSchema } from '../validations/community.validation';

const router = Router();

router.get('/', authenticate, communityController.list);
router.get('/settings', authenticate, communityController.settings);
router.post('/', authenticate, validate(createMessageSchema), communityController.create);
router.delete('/:id', authenticate, communityController.remove);

export default router;
