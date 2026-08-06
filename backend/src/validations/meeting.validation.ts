import { z } from 'zod';

export const createMeetingSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(200, 'Title is too long.'),
  description: z.string().trim().max(2000, 'Description is too long.').optional(),
  scheduledAt: z.coerce.date().optional(),
  maxParticipants: z.number().int().min(2, 'At least 2 participants are required.').max(1000, 'Too many participants.').optional(),
});

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;

export const joinByCodeSchema = z.object({
  joinCode: z.string().trim().min(3, 'Meeting code is invalid.').max(16, 'Meeting code is invalid.'),
  name: z.string().trim().min(1, 'Your name is required.').max(100, 'Name is too long.'),
});

export type JoinByCodeInput = z.infer<typeof joinByCodeSchema>;

export const meetingChatSchema = z.object({
  message: z.string().trim().min(1, 'Message cannot be empty.').max(2000, 'Message is too long.'),
});

export type MeetingChatInput = z.infer<typeof meetingChatSchema>;

export const attendanceSchema = z.object({
  duration: z.number().int().min(0).optional(),
  cameraOnTime: z.number().int().min(0).optional(),
  micOnTime: z.number().int().min(0).optional(),
});

export type AttendanceInput = z.infer<typeof attendanceSchema>;
