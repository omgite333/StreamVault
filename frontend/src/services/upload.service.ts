import { api } from '../lib/axios'
import type { ApiResponse } from '../types'
import type { UploadUrlInput } from '../validations/upload'

export interface UploadUrlResponse {
  url: string
  key: string
}

export interface UploadProgress {
  percent: number
  loaded: number
  total: number
}

export interface PutObjectHandle {
  promise: Promise<{ ok: boolean; status: number }>
  abort: () => void
}

export const uploadService = {
  getUploadUrl: (payload: UploadUrlInput) =>
    api.post<ApiResponse<UploadUrlResponse>>('/uploads/url', payload),
  putObject: (url: string, file: File, fileType: string) =>
    fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': fileType },
      body: file,
    }),
  putObjectWithProgress: (
    url: string,
    file: File,
    fileType: string,
    onProgress?: (progress: UploadProgress) => void,
  ): PutObjectHandle => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', fileType)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress?.({
          percent: e.total > 0 ? Math.min(100, Math.round((e.loaded / e.total) * 100)) : 0,
          loaded: e.loaded,
          total: e.total,
        })
      }
    }
    const promise = new Promise<{ ok: boolean; status: number }>((resolve, reject) => {
      xhr.onload = () => resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status })
      xhr.onerror = () => reject(new Error('Network error during upload.'))
      xhr.onabort = () => reject(new Error('Upload cancelled.'))
    })
    xhr.send(file)
    return { promise, abort: () => xhr.abort() }
  },
}
