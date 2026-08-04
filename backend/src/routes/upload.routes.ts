import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { uploadUrlSchema } from '../validations/upload.validation';

const router = Router();

router.post('/url', authenticate, authorizeAdmin, validate(uploadUrlSchema), uploadController.getUploadUrl);

export default router;
