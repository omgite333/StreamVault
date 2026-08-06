import { Router } from 'express';
import authRoutes from './auth.routes';
import courseRoutes from './course.routes';
import videoRoutes from './video.routes';
import uploadRoutes from './upload.routes';
import progressRoutes from './progress.routes';
import adminRoutes from './admin.routes';
import communityRoutes from './community.routes';
import commentRoutes from './comment.routes';
import meetingRoutes from './meeting.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/videos', videoRoutes);
router.use('/uploads', uploadRoutes);
router.use('/progress', progressRoutes);
router.use('/admin', adminRoutes);
router.use('/community', communityRoutes);
router.use('/videos', commentRoutes);
router.use('/meetings', meetingRoutes);

export default router;
