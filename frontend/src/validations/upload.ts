import { z } from 'zod'

export const uploadUrlSchema = z.object({
  fileType: z.string().min(1),
  folder: z.enum(['videos', 'thumbnails', 'resources', 'avatars']),
})

export type UploadUrlInput = z.infer<typeof uploadUrlSchema>
