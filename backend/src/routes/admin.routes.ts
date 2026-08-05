import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = Router();

router.get('/analytics', authenticate, authorizeAdmin, adminController.analytics);
router.get('/users', authenticate, authorizeAdmin, adminController.listUsers);
router.patch('/users/:id/role', authenticate, authorizeAdmin, adminController.changeRole);

router.get('/community/messages', authenticate, authorizeAdmin, adminController.communityMessages);
router.get('/community/comments', authenticate, authorizeAdmin, adminController.communityComments);
router.delete('/community/messages/:id', authenticate, authorizeAdmin, adminController.removeCommunityMessage);
router.delete('/community/comments/:id', authenticate, authorizeAdmin, adminController.removeCommunityComment);
router.get('/community/settings', authenticate, authorizeAdmin, adminController.communitySettings);
router.patch('/community/settings', authenticate, authorizeAdmin, adminController.updateCommunitySettings);

export default router;
