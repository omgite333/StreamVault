import { api } from '../lib/axios'
import type { ApiResponse, VideoComment } from '../types'

export const commentService = {
  list: (videoId: string) => api.get<ApiResponse<VideoComment[]>>(`/videos/${videoId}/comments`),
  create: (videoId: string, content: string) =>
    api.post<ApiResponse<VideoComment>>(`/videos/${videoId}/comments`, { content }),
  remove: (videoId: string, commentId: string) =>
    api.delete<ApiResponse<null>>(`/videos/${videoId}/comments/${commentId}`),
}
