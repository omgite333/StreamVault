import { Link } from 'react-router-dom'
import { History } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import { MeetingCard } from '../components/meeting/MeetingCard'
import { useMeetings } from '../hooks/useMeetings'
import { usePageTitle } from '../hooks/usePageTitle'

export const MeetingHistoryPage = () => {
  usePageTitle('Meeting History')
  const { meetings, isLoading } = useMeetings('past')

  const past = (meetings ?? []).filter((m) => m.status === 'ENDED')

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <History className="size-7 text-primary" />
            Meeting History
          </h1>
          <p className="mt-1 text-muted-foreground">Replays of meetings you attended or hosted.</p>
        </div>
        <Link to="/meeting">
          <Button variant="outline">Back to Meetings</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52" />
          ))}
        </div>
      ) : past.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">No past meetings yet. Join a live session to see it here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {past.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      )}
    </div>
  )
}
