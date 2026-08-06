import { z } from 'zod'

export const createMeetingSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(200, 'Title is too long.'),
  description: z.string().trim().max(2000, 'Description is too long.').optional().or(z.literal('')),
  scheduledAt: z.string().optional(),
  maxParticipants: z.number().int().min(2, 'At least 2 participants.').max(1000, 'Too many participants.').optional(),
})

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>
