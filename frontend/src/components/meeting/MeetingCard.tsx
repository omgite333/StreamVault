import { Link } from 'react-router-dom'
import { Calendar, Clock, Radio, Trash2, Users } from 'lucide-react'
import type { Meeting } from '../../types'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { formatDate } from '../../lib/utils'

const statusStyles: Record<Meeting['status'], { label: string; className: string }> = {
  LIVE: { label: 'Live', className: 'bg-destructive text-destructive-foreground' },
  SCHEDULED: { label: 'Upcoming', className: 'bg-secondary text-secondary-foreground' },
  ENDED: { label: 'Ended', className: 'bg-muted text-muted-foreground' },
}

interface MeetingCardProps {
  meeting: Meeting
  canDelete?: boolean
  onDelete?: (meeting: Meeting) => void
}

export const MeetingCard = ({ meeting, canDelete, onDelete }: MeetingCardProps) => {
  const status = statusStyles[meeting.status]
  const participantCount = meeting._count?.participants ?? 0

  return (
    <Card className="overflow-hidden transition-colors hover:border-primary/50">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
        <CardTitle className="line-clamp-1 text-base">{meeting.title}</CardTitle>
        <Badge className={status.className}>{status.label}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
          {meeting.description || 'No description provided.'}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3.5" />
            {formatDate(meeting.scheduledAt)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            {new Date(meeting.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" />
            {participantCount} participant{participantCount === 1 ? '' : 's'}
          </span>
          <span className="inline-flex items-center gap-1">Hosted by {meeting.host.name}</span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          {meeting.status === 'LIVE' && (
            <Link to={`/meeting/${meeting.id}`} className="flex-1">
              <Button className="w-full">
                <Radio />
                Join Live
              </Button>
            </Link>
          )}
          {meeting.status === 'SCHEDULED' && (
            <Link to={`/meeting/${meeting.id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Link>
          )}
          {meeting.status === 'ENDED' && meeting.recordingUrl && (
            <a href={meeting.recordingUrl} target="_blank" rel="noreferrer" className="flex-1">
              <Button variant="outline" className="w-full">
                Watch Replay
              </Button>
            </a>
          )}
          {meeting.status === 'ENDED' && !meeting.recordingUrl && (
            <Link to={`/meeting/${meeting.id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                Details
              </Button>
            </Link>
          )}
          {canDelete && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(meeting)}
              aria-label={`Delete ${meeting.title}`}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
