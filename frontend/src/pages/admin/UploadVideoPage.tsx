import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CircleCheck, CloudUpload, ImagePlus, X } from 'lucide-react'
import { useCourses } from '../../hooks/useCourses'
import { uploadService, type UploadProgress } from '../../services/upload.service'
import { videoService } from '../../services/video.service'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Spinner } from '../../components/ui/spinner'
import { useToast } from '../../components/ui/toast-context'
import { getErrorMessage } from '../../lib/utils'
import { usePageTitle } from '../../hooks/usePageTitle'

type UploadStatus = 'idle' | 'uploading' | 'finalizing' | 'done' | 'error'

const getVideoDuration = (file: File) =>
  new Promise<number>((resolve) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.src = url
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      resolve(Number.isFinite(video.duration) ? Math.floor(video.duration) : 0)
    }
    video.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(0)
    }
  })

const inputClass =
  'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm'

export const UploadVideoPage = () => {
  usePageTitle('Upload Video')
  const { courses, isLoading: loadingCourses } = useCourses()
  const { toast } = useToast()

  const [courseId, setCourseId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [allowDownload, setAllowDownload] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbPreview, setThumbPreview] = useState<string | null>(null)
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [error, setError] = useState('')
  const [progress, setProgress] = useState<UploadProgress>({ percent: 0, loaded: 0, total: 0 })
  const [speed, setSpeed] = useState(0)
  const uploadStartRef = useRef(0)
  const lastLoadedRef = useRef(0)
  const lastTimeRef = useRef(0)

  const isBusy = status === 'uploading' || status === 'finalizing'

  const selectThumbnail = (selected: File | null) => {
    if (thumbPreview) URL.revokeObjectURL(thumbPreview)
    setThumbnailFile(selected)
    setThumbPreview(selected ? URL.createObjectURL(selected) : null)
  }

  const handleUpload = async () => {
    setError('')
    if (!courseId || !title.trim() || !file) {
      setError('Please select a course, enter a title, and choose a video file.')
      return
    }

    try {
      setStatus('uploading')
      setProgress({ percent: 0, loaded: 0, total: 0 })
      setSpeed(0)
      const fileType = file.type || 'video/mp4'
      const { data } = await uploadService.getUploadUrl({ fileType, folder: 'videos' })
      const { url, key } = data.data

      uploadStartRef.current = Date.now()
      lastLoadedRef.current = 0
      lastTimeRef.current = uploadStartRef.current

      const response = await uploadService.putObjectWithProgress(url, file, fileType, (p) => {
        setProgress(p)
        const now = Date.now()
        if (now - lastTimeRef.current >= 500) {
          const delta = now - lastTimeRef.current
          const bytes = p.loaded - lastLoadedRef.current
          if (delta > 0) setSpeed((bytes / delta) * 1000 / (1024 * 1024))
          lastLoadedRef.current = p.loaded
          lastTimeRef.current = now
        }
      })
      if (!response.ok) {
        throw new Error('Upload to storage failed.')
      }

      let thumbnail: string | undefined
      if (thumbnailFile) {
        const thumbType = thumbnailFile.type || 'image/png'
        const { data: thumbData } = await uploadService.getUploadUrl({ fileType: thumbType, folder: 'thumbnails' })
        const thumbResponse = await uploadService.putObject(thumbData.data.url, thumbnailFile, thumbType)
        if (!thumbResponse.ok) {
          throw new Error('Thumbnail upload failed.')
        }
        thumbnail = thumbData.data.key
      }

      setStatus('finalizing')
      const duration = await getVideoDuration(file)
      await videoService.create({
        courseId,
        title: title.trim(),
        description: description.trim() || undefined,
        s3Key: key,
        thumbnail,
        duration,
        allowDownload,
      })

      setStatus('done')
      toast({
        title: 'Video uploaded',
        description: `"${title.trim()}" is now live in the course.`,
        variant: 'success',
      })
    } catch (e) {
      setStatus('error')
      const message = getErrorMessage(e, 'Upload failed. Please try again.')
      setError(message)
      toast({ title: 'Upload failed', description: message, variant: 'error' })
    }
  }

  if (status === 'done') {
    return (
      <div className="mx-auto max-w-lg">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <CircleCheck className="size-12 text-success" />
            <h1 className="text-2xl font-bold">Video uploaded!</h1>
            <p className="text-sm text-muted-foreground">
              "{title}" was uploaded to storage and added to the course.
            </p>
            <div className="flex gap-3">
              <Link to="/admin/courses">
                <Button variant="outline">Manage Courses</Button>
              </Link>
              <Link to="/admin/upload">
                <Button>Upload Another</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Video</h1>
        <p className="text-muted-foreground">
          Videos upload directly to secure cloud storage, then metadata is saved.
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          void handleUpload()
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="course">Course</Label>
          <select
            id="course"
            className={inputClass}
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            disabled={loadingCourses}
          >
            <option value="">Select a course...</option>
            {(courses ?? []).map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Video title</Label>
          <Input
            id="title"
            placeholder="e.g. Introduction to React Hooks"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            rows={3}
            placeholder="What does this video cover?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="file">Video file</Label>
          <Input
            id="file"
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-muted-foreground">
            {file ? `${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)` : 'MP4, WebM, or MOV'}
          </p>
        </div>

        <div className="space-y-2">
          <Label>Thumbnail (optional)</Label>
          {thumbPreview ? (
            <div className="relative overflow-hidden rounded-lg border">
              <img src={thumbPreview} alt="Thumbnail preview" className="aspect-video w-full object-contain" />
              <button
                type="button"
                onClick={() => selectThumbnail(null)}
                className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black"
                aria-label="Remove thumbnail"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="thumbnail"
              className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-input p-6 text-center transition-colors hover:bg-secondary/50"
            >
              <ImagePlus className="size-6 text-muted-foreground" />
              <span className="text-sm font-medium">Add thumbnail</span>
              <span className="text-xs text-muted-foreground">PNG or JPG, 16:9 recommended</span>
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => selectThumbnail(e.target.files?.[0] ?? null)}
              />
            </label>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={allowDownload}
            onChange={(e) => setAllowDownload(e.target.checked)}
            className="size-4 rounded border-input"
          />
          Allow students to download this video
        </label>

        {error && <p className="text-xs text-destructive">{error}</p>}

        {status === 'uploading' && (
          <div className="rounded-lg border p-4">
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-medium">{file?.name}</span>
              <span className="shrink-0 tabular-nums">{progress.percent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {(progress.loaded / (1024 * 1024)).toFixed(1)} MB / {(progress.total / (1024 * 1024)).toFixed(1)} MB
              {speed > 0 && ` at ${speed.toFixed(1)} MB/s`}
              {speed > 0 && ` · ~${Math.max(1, Math.round(((progress.total - progress.loaded) / (1024 * 1024)) / speed))}s left`}
            </p>
          </div>
        )}

        <Button type="submit" disabled={isBusy}>
          {isBusy && <Spinner />}
          {status === 'uploading'
            ? `Uploading to storage... ${progress.percent}%`
            : status === 'finalizing'
              ? 'Saving metadata...'
              : (
                <>
                  <CloudUpload />
                  Upload Video
                </>
              )}
        </Button>
      </form>
    </div>
  )
}
