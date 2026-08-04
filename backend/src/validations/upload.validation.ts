import { z } from 'zod';

export const uploadUrlSchema = z.object({
  fileType: z.string().min(1, 'fileType is required'),
  folder: z.enum(['videos', 'thumbnails', 'resources', 'avatars']),
});

export const createResourceSchema = z.object({
  videoId: z.string().min(1),
  title: z.string().min(1),
  fileUrl: z.string().min(1),
  type: z.string().default('pdf'),
});

export type UploadUrlInput = z.infer<typeof uploadUrlSchema>;
export type CreateResourceInput = z.infer<typeof createResourceSchema>;
