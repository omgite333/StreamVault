import { create } from 'zustand'
import { uploadService } from '../services/upload.service'
import { videoService } from '../services/video.service'
import { toWebP } from '../lib/image'
import { getVideoDuration } from '../lib/video'
import { getErrorMessage } from '../lib/utils'

export type UploadStatus = 'uploading' | 'finalizing' | 'done' | 'error'

export interface ActiveUpload {
  id: string
  fileName: string
  title: string
  percent: number
  loaded: number
  total: number
  speed: number
  status: UploadStatus
  error?: string
}

export interface StartUploadInput {
  file: File
  thumbnailFile: File | null
  courseId: string
  title: string
  description?: string
  allowDownload: boolean
}

interface UploadStoreState {
  uploads: Record<string, ActiveUpload>
  start: (input: StartUploadInput) => string
  update: (id: string, patch: Partial<ActiveUpload>) => void
  remove: (id: string) => void
  cancel: (id: string) => void
}

const abortHandles = new Map<string, () => void>()

const without = (uploads: Record<string, ActiveUpload>, id: string) => {
  const next = { ...uploads }
  delete next[id]
  return next
}

export const useUploadStore = create<UploadStoreState>()((set) => ({
  uploads: {},
  start: (input) => {
    const id = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    set((s) => ({
      uploads: {
        ...s.uploads,
        [id]: {
          id,
          fileName: input.file.name,
          title: input.title,
          percent: 0,
          loaded: 0,
          total: 0,
          speed: 0,
          status: 'uploading',
        },
      },
    }))
    void runUpload(id, input)
    return id
  },
  update: (id, patch) =>
    set((s) => {
      if (!s.uploads[id]) return s
      return { uploads: { ...s.uploads, [id]: { ...s.uploads[id], ...patch } } }
    }),
  remove: (id) => {
    abortHandles.delete(id)
    set((s) => ({ uploads: without(s.uploads, id) }))
  },
  cancel: (id) => {
    abortHandles.get(id)?.()
    abortHandles.delete(id)
    set((s) => ({ uploads: without(s.uploads, id) }))
  },
}))

const runUpload = async (id: string, input: StartUploadInput) => {
  const update = (patch: Partial<ActiveUpload>) => useUploadStore.getState().update(id, patch)
  let lastLoaded = 0
  let lastTime = Date.now()

  try {
    const fileType = input.file.type || 'video/mp4'
    const { data } = await uploadService.getUploadUrl({ fileType, folder: 'videos' })
    const { url, key } = data.data

    const handle = uploadService.putObjectWithProgress(url, input.file, fileType, (p) => {
      const now = Date.now()
      const delta = now - lastTime
      let speed = 0
      if (delta >= 500) {
        speed = ((p.loaded - lastLoaded) / delta) * 1000 / (1024 * 1024)
        lastLoaded = p.loaded
        lastTime = now
      }
      update({ percent: p.percent, loaded: p.loaded, total: p.total, speed })
    })
    abortHandles.set(id, handle.abort)
    const response = await handle.promise
    abortHandles.delete(id)
    if (!response.ok) throw new Error('Upload to storage failed.')

    let thumbnail: string | undefined
    if (input.thumbnailFile) {
      const thumbFile = await toWebP(input.thumbnailFile)
      const thumbType = thumbFile.type || 'image/webp'
      const { data: thumbData } = await uploadService.getUploadUrl({ fileType: thumbType, folder: 'thumbnails' })
      const thumbResponse = await uploadService.putObject(thumbData.data.url, thumbFile, thumbType)
      if (!thumbResponse.ok) throw new Error('Thumbnail upload failed.')
      thumbnail = thumbData.data.key
    }

    update({ status: 'finalizing' })
    const duration = await getVideoDuration(input.file)
    await videoService.create({
      courseId: input.courseId,
      title: input.title.trim(),
      description: input.description?.trim() || undefined,
      s3Key: key,
      thumbnail,
      duration,
      allowDownload: input.allowDownload,
    })

    update({ status: 'done', percent: 100 })
  } catch (error) {
    abortHandles.delete(id)
    if (!useUploadStore.getState().uploads[id]) return
    update({ status: 'error', error: getErrorMessage(error, 'Upload failed. Please try again.') })
  }
}
