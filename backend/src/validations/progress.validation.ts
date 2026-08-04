import { z } from 'zod';

export const updateProgressSchema = z.object({
  videoId: z.string().min(1, 'videoId is required'),
  lastTimestamp: z.number().int().nonnegative().max(86_400),
  completed: z.boolean().optional().default(false),
});

export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
