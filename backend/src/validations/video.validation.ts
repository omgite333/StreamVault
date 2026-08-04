import { z } from 'zod';

export const createVideoSchema = z.object({
  courseId: z.string().min(1, 'courseId is required'),
  sectionId: z.string().optional().nullable(),
  title: z.string().min(1, 'Title is required').max(300),
  description: z.string().optional(),
  duration: z.number().int().nonnegative().optional(),
  thumbnail: z.string().optional(),
  s3Key: z.string().min(1, 's3Key is required'),
  order: z.number().int().nonnegative().optional(),
  allowDownload: z.boolean().default(false),
});

export const updateVideoSchema = createVideoSchema.partial();

export type CreateVideoInput = z.infer<typeof createVideoSchema>;
export type UpdateVideoInput = z.infer<typeof updateVideoSchema>;
