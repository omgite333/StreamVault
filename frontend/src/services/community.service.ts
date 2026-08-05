import { api } from '../lib/axios'
import type { ApiResponse, CommunityMessage, CommunitySettings } from '../types'

export interface CreateCommunityMessagePayload {
  content: string
  parentId?: string
}

export const communityService = {
  list: () => api.get<ApiResponse<CommunityMessage[]>>('/community'),
  settings: () => api.get<ApiResponse<CommunitySettings>>('/community/settings'),
  create: (payload: CreateCommunityMessagePayload) =>
    api.post<ApiResponse<CommunityMessage>>('/community', payload),
  remove: (id: string) => api.delete<ApiResponse<null>>(`/community/${id}`),
}
