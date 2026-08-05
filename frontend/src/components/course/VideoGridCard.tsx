import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ImagePlus, Loader2, PlayCircle, Trash2 } from 'lucide-react'
import { formatDuration } from '../../lib/utils'
import type { Video } from '../../types'

interface VideoGridCardProps {
  video: Video
  courseId: string
  canEdit?: boolean
  onThumbnail?: (video: Video, file: File) => Promise<void>
  onRemove?: (video: Video) => Promise<void>
}

export const VideoGridCard = ({ video, courseId, canEdit = false, onThumbnail, onRemove }: VideoGridCardProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState(false)

  const handleFile = async (file: File | null) => {
    if (!file || !onThumbnail) return
    setUploading(true)
    try {
      await onThumbnail(video, file)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleRemove = async () => {
    if (!onRemove) return
    setRemoving(true)
    try {
      await onRemove(video)
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className="group overflow-hidden rounded-3xl border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg">
      <Link to={`/courses/${courseId}/videos/${video.id}`} className="block">
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/15 via-accent to-primary/5">
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              width={1280}
              height={720}
              loading="lazy"
              decoding="async"
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <PlayCircle className="size-14 text-primary/40" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
            <PlayCircle className="size-16 text-white drop-shadow" />
          </div>
          {video.duration ? (
            <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
              {formatDuration(video.duration)}
            </span>
          ) : null}
        </div>
        <div className="p-4">
          <p className="line-clamp-2 text-sm font-semibold leading-snug">{video.title}</p>
        </div>
      </Link>
      {canEdit && (
        <div className="space-y-2 px-4 pb-4">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
          >
            {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}
            {video.thumbnailUrl ? 'Change thumbnail' : 'Add thumbnail'}
          </button>
          {onRemove && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Remove "${video.title}"? This cannot be undone.`)) void handleRemove()
              }}
              disabled={removing}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-destructive/30 px-2.5 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
            >
              {removing ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
              Remove video
            </button>
          )}
        </div>
      )}
    </div>
  )
}
