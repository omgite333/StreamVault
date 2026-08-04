import { api } from '../lib/axios'
import type { ApiResponse, Course, CourseDetails } from '../types'

export interface CoursePayload {
  title: string
  description: string
  thumbnail?: string
}

export const courseService = {
  list: () => api.get<ApiResponse<Course[]>>('/courses'),
  get: (id: string) => api.get<ApiResponse<CourseDetails>>(`/courses/${id}`),
  create: (payload: CoursePayload) => api.post<ApiResponse<Course>>('/courses', payload),
  update: (id: string, payload: Partial<CoursePayload>) =>
    api.patch<ApiResponse<Course>>(`/courses/${id}`, payload),
  remove: (id: string) => api.delete<ApiResponse<null>>(`/courses/${id}`),
}
