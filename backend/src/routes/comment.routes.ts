import { Router } from 'express';
import * as commentController from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCommentSchema } from '../validations/comment.validation';

const router = Router();

router.get('/:videoId/comments', authenticate, commentController.list);
router.post('/:videoId/comments', authenticate, validate(createCommentSchema), commentController.create);
router.delete('/:videoId/comments/:commentId', authenticate, commentController.remove);

export default router;
