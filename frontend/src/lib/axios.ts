import { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../store/auth.store'
import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: true,
})

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

let isRefreshing = false
let failedQueue: Array<(token: string | null) => void> = []

const processQueue = (token: string | null) => {
  failedQueue.forEach((cb) => cb(token))
  failedQueue = []
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined
    const isRefreshCall = original?.url?.includes('/auth/refresh')

    if (error.response?.status === 401 && original && !original._retry && !isRefreshCall) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push((token) => {
            if (token) {
              original.headers.Authorization = `Bearer ${token}`
              resolve(api(original))
            } else {
              reject(error)
            }
          })
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const { data } = await api.post<{ data: { accessToken: string } }>('/auth/refresh')
        const token = data.data.accessToken
        useAuthStore.getState().setToken(token)
        processQueue(token)
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      } catch (refreshError) {
        processQueue(null)
        useAuthStore.getState().logout()
        if (window.location.pathname !== '/auth/login') {
          window.location.href = '/auth/login'
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)
