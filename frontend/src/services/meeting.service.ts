import { api } from '../lib/axios'
import type { ApiResponse, JoinMeetingData, Meeting, MeetingChatMessage, MeetingParticipant } from '../types'

export type MeetingFilter = 'all' | 'upcoming' | 'live' | 'past'

export interface CreateMeetingPayload {
  title: string
  description?: string
  scheduledAt?: string
  maxParticipants?: number
}

export interface LeaveMeetingPayload {
  duration?: number
  cameraOnTime?: number
  micOnTime?: number
}

export const meetingService = {
  list: (filter: MeetingFilter = 'all') =>
    api.get<ApiResponse<Meeting[]>>('/meetings', { params: { filter } }),
  get: (id: string) => api.get<ApiResponse<Meeting>>(`/meetings/${id}`),
  create: (payload: CreateMeetingPayload) => api.post<ApiResponse<Meeting>>('/meetings', payload),
  remove: (id: string) => api.delete<ApiResponse<null>>(`/meetings/${id}`),
  join: (id: string) => api.post<ApiResponse<JoinMeetingData>>(`/meetings/${id}/join`),
  joinByCode: (payload: { joinCode: string; name: string }) =>
    api.post<ApiResponse<JoinMeetingData>>('/meetings/join', payload),
  leave: (id: string, payload: LeaveMeetingPayload) =>
    api.post<ApiResponse<null>>(`/meetings/${id}/leave`, payload),
  start: (id: string) => api.post<ApiResponse<Meeting>>(`/meetings/${id}/start`),
  end: (id: string) => api.post<ApiResponse<Meeting>>(`/meetings/${id}/end`),
  kick: (id: string, identity: string) =>
    api.post<ApiResponse<{ removed: string }>>(`/meetings/${id}/kick/${identity}`),
  startRecording: (id: string) =>
    api.post<ApiResponse<{ egressId: string }>>(`/meetings/${id}/recording/start`),
  stopRecording: (id: string) =>
    api.post<ApiResponse<{ stopped: boolean; recordingUrl?: string | null }>>(`/meetings/${id}/recording/stop`),
  chat: (id: string) => api.get<ApiResponse<MeetingChatMessage[]>>(`/meetings/${id}/chat`),
  sendChat: (id: string, message: string) =>
    api.post<ApiResponse<MeetingChatMessage>>(`/meetings/${id}/chat`, { message }),
}

export type { Meeting, MeetingParticipant, JoinMeetingData }

const tokenStorageKey = (id: string) => `sv_meeting_token_${id}`

export const getStoredJoinToken = (id: string): JoinMeetingData | null => {
  const raw = sessionStorage.getItem(tokenStorageKey(id))
  if (!raw) return null
  try {
    return JSON.parse(raw) as JoinMeetingData
  } catch {
    return null
  }
}

export const storeJoinToken = (id: string, data: JoinMeetingData) => {
  sessionStorage.setItem(tokenStorageKey(id), JSON.stringify(data))
}

export const clearStoredJoinToken = (id: string) => {
  sessionStorage.removeItem(tokenStorageKey(id))
}
