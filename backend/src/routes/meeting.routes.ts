import { Router } from 'express';
import * as meetingController from '../controllers/meeting.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  attendanceSchema,
  createMeetingSchema,
  joinByCodeSchema,
  meetingChatSchema,
} from '../validations/meeting.validation';

const router = Router();

router.get('/', meetingController.list);
router.post('/', authenticate, validate(createMeetingSchema), meetingController.create);
router.post('/join', validate(joinByCodeSchema), meetingController.joinByCode);
router.get('/:id', meetingController.get);
router.get('/:id/chat', authenticate, meetingController.listChat);
router.post('/:id/chat', authenticate, validate(meetingChatSchema), meetingController.sendChat);
router.post('/:id/join', authenticate, meetingController.join);
router.post('/:id/leave', authenticate, validate(attendanceSchema), meetingController.leave);
router.post('/:id/start', authenticate, meetingController.start);
router.post('/:id/end', authenticate, meetingController.end);
router.post('/:id/kick/:identity', authenticate, meetingController.kick);
router.post('/:id/recording/start', authenticate, meetingController.startRecording);
router.post('/:id/recording/stop', authenticate, meetingController.stopRecording);
router.delete('/:id', authenticate, meetingController.remove);

export default router;
