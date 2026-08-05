import { z } from 'zod';

export const createMessageSchema = z.object({
  content: z.string().trim().min(1, 'Message cannot be empty.').max(2000, 'Message is too long.'),
  parentId: z.string().min(1, 'parentId is required').optional(),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
