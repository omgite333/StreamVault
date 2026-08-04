import { api } from '../lib/axios'
import type { Analytics, ApiResponse, User } from '../types'

export const adminService = {
  getAnalytics: () => api.get<ApiResponse<Analytics>>('/admin/analytics'),
  getUsers: () => api.get<ApiResponse<User[]>>('/admin/users'),
  updateUserRole: (id: string, role: User['role']) =>
    api.patch<ApiResponse<User>>(`/admin/users/${id}/role`, { role }),
}
