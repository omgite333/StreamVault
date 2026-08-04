import { Router } from 'express';
import authRoutes from './auth.routes';
import courseRoutes from './course.routes';
import videoRoutes from './video.routes';
import uploadRoutes from './upload.routes';
import progressRoutes from './progress.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/videos', videoRoutes);
router.use('/uploads', uploadRoutes);
router.use('/progress', progressRoutes);
router.use('/admin', adminRoutes);

export default router;
