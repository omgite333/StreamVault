import { Link } from 'react-router-dom'
import { PlayCircle } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { Video } from '../../types'

interface VideoCardProps {
  video: Video
  courseId: string
  isActive?: boolean
}

export const VideoCard = ({ video, courseId, isActive = false }: VideoCardProps) => (
  <Link
    to={`/courses/${courseId}/videos/${video.id}`}
    className={cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
      isActive ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground hover:bg-secondary',
    )}
  >
    <div className="relative size-9 shrink-0 overflow-hidden rounded-md bg-secondary">
      {video.thumbnailUrl ? (
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          width={72}
          height={72}
          loading="lazy"
          decoding="async"
          className="size-full object-contain"
        />
      ) : (
        <PlayCircle className="absolute inset-0 m-auto size-4 text-muted-foreground" />
      )}
    </div>
    <span className="line-clamp-1 flex-1">{video.title}</span>
  </Link>
)
