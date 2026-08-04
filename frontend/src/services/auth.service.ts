import { api } from '../lib/axios'
import type { ApiResponse, User } from '../types'
import type { LoginInput, RegisterInput } from '../validations/auth'

export interface AuthResponse {
  user: User
  accessToken: string
}

export interface UpdateProfilePayload {
  name?: string
  profileImage?: string | null
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export const authService = {
  register: (payload: RegisterInput) => api.post<ApiResponse<AuthResponse>>('/auth/register', payload),
  login: (payload: LoginInput) => api.post<ApiResponse<AuthResponse>>('/auth/login', payload),
  logout: () => api.post<ApiResponse<null>>('/auth/logout'),
  refresh: () => api.post<ApiResponse<AuthResponse>>('/auth/refresh'),
  me: () => api.get<ApiResponse<{ user: User }>>('/auth/me'),
  updateMe: (payload: UpdateProfilePayload) => api.patch<ApiResponse<{ user: User }>>('/auth/me', payload),
  changePassword: (payload: ChangePasswordPayload) => api.post<ApiResponse<null>>('/auth/change-password', payload),
  oauthUrl: (provider: 'google') => api.get<ApiResponse<{ url: string }>>(`/auth/oauth/${provider}`),
}
