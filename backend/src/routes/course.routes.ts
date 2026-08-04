import { Router } from 'express';
import * as courseController from '../controllers/course.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCourseSchema, updateCourseSchema } from '../validations/course.validation';

const router = Router();

router.get('/', courseController.list);
router.get('/:id', courseController.getById);
router.post('/', authenticate, authorizeAdmin, validate(createCourseSchema), courseController.create);
router.patch('/:id', authenticate, authorizeAdmin, validate(updateCourseSchema), courseController.update);
router.delete('/:id', authenticate, authorizeAdmin, courseController.remove);

export default router;
