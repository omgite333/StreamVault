import { api } from '../lib/axios'
import type { ApiResponse, Progress } from '../types'

export interface ProgressPayload {
  videoId: string
  lastTimestamp: number
  completed?: boolean
}

export const progressService = {
  get: () => api.get<ApiResponse<Progress[]>>('/progress'),
  update: (payload: ProgressPayload) => api.put<ApiResponse<Progress>>('/progress', payload),
}
