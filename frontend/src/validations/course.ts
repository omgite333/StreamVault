import { z } from 'zod'

export const createCourseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  thumbnail: z.string().optional(),
})

export type CreateCourseInput = z.infer<typeof createCourseSchema>
