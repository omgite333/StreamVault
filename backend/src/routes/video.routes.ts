import { Router } from 'express';
import * as videoController from '../controllers/video.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createVideoSchema, updateVideoSchema } from '../validations/video.validation';
import { createResourceSchema } from '../validations/upload.validation';

const router = Router();

router.get('/:id', authenticate, videoController.getById);
router.post('/', authenticate, authorizeAdmin, validate(createVideoSchema), videoController.create);
router.patch('/:id', authenticate, authorizeAdmin, validate(updateVideoSchema), videoController.update);
router.delete('/:id', authenticate, authorizeAdmin, videoController.remove);
router.post('/resources', authenticate, authorizeAdmin, validate(createResourceSchema), videoController.addResource);
router.delete('/resources/:id', authenticate, authorizeAdmin, videoController.removeResource);

export default router;
