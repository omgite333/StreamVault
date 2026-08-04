import { api } from '../lib/axios'
import type { ApiResponse, Resource, Video } from '../types'

export interface VideoPayload {
  courseId: string
  sectionId?: string | null
  title: string
  description?: string
  duration?: number
  thumbnail?: string
  s3Key: string
  order?: number
  allowDownload?: boolean
}

export interface VideoWithStream extends Video {
  streamUrl: string | null
}

export const videoService = {
  get: (id: string) => api.get<ApiResponse<VideoWithStream>>(`/videos/${id}`),
  create: (payload: VideoPayload) => api.post<ApiResponse<Video>>('/videos', payload),
  update: (id: string, payload: Partial<VideoPayload>) =>
    api.patch<ApiResponse<Video>>(`/videos/${id}`, payload),
  remove: (id: string) => api.delete<ApiResponse<null>>(`/videos/${id}`),
  addResource: (payload: { videoId: string; title: string; fileUrl: string; type?: string }) =>
    api.post<ApiResponse<Resource>>('/resources', payload),
  removeResource: (id: string) => api.delete<ApiResponse<null>>(`/resources/${id}`),
}
