import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { Badge } from '../ui/badge'
import { formatTimestamp } from '../../lib/utils'
import type { Progress } from '../../types'

interface ContinueWatchingItemProps {
  item: Progress
}

export const ContinueWatchingItem = ({ item }: ContinueWatchingItemProps) => {
  const duration = item.video?.duration ?? 0
  const percent = duration > 0 ? Math.min(100, Math.round((item.lastTimestamp / duration) * 100)) : 0

  return (
    <Link
      to={`/courses/${item.video?.courseId}/videos/${item.videoId}`}
      className="block rounded-xl border bg-card p-4 transition-colors hover:border-primary/40"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-medium">{item.video?.title ?? 'Video'}</p>
          <p className="truncate text-sm text-muted-foreground">{item.course?.title}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {item.completed && (
            <Badge variant="success">
              <CheckCircle2 className="mr-1 size-3" />
              Completed
            </Badge>
          )}
          <span className="text-sm text-muted-foreground">{formatTimestamp(item.lastTimestamp)}</span>
        </div>
      </div>
      {duration > 0 && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
        </div>
      )}
    </Link>
  )
}
