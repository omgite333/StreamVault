import { api } from '../lib/axios'
import type { Analytics, ApiResponse, CommunityMessage, CommunitySettings, User, VideoComment } from '../types'

export const adminService = {
  getAnalytics: () => api.get<ApiResponse<Analytics>>('/admin/analytics'),
  getUsers: () => api.get<ApiResponse<User[]>>('/admin/users'),
  updateUserRole: (id: string, role: User['role']) =>
    api.patch<ApiResponse<User>>(`/admin/users/${id}/role`, { role }),
  getCommunitySettings: () => api.get<ApiResponse<CommunitySettings>>('/admin/community/settings'),
  updateCommunitySettings: (enabled: boolean) =>
    api.patch<ApiResponse<CommunitySettings>>('/admin/community/settings', { enabled }),
  getCommunityMessages: () => api.get<ApiResponse<CommunityMessage[]>>('/admin/community/messages'),
  deleteCommunityMessage: (id: string) => api.delete<ApiResponse<null>>(`/admin/community/messages/${id}`),
  getCommunityComments: () => api.get<ApiResponse<VideoComment[]>>('/admin/community/comments'),
  deleteCommunityComment: (id: string) => api.delete<ApiResponse<null>>(`/admin/community/comments/${id}`),
}
