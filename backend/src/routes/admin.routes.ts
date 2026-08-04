import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = Router();

router.get('/analytics', authenticate, authorizeAdmin, adminController.analytics);
router.get('/users', authenticate, authorizeAdmin, adminController.listUsers);
router.patch('/users/:id/role', authenticate, authorizeAdmin, adminController.changeRole);

export default router;
