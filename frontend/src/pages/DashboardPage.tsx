import { Link } from 'react-router-dom'
import { BookOpen, Clock, PlayCircle, Radio, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { ContinueWatchingItem } from '../components/course/ContinueWatchingItem'
import { useAuthStore } from '../store/auth.store'
import { useCourses } from '../hooks/useCourses'
import { useProgress } from '../hooks/useProgress'
import { useMeetings } from '../hooks/useMeetings'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatDate, formatTotalTime } from '../lib/utils'
import { Badge } from '../components/ui/badge'

export const DashboardPage = () => {
  usePageTitle('Dashboard')
  const user = useAuthStore((s) => s.user)
  const { courses, isLoading } = useCourses()
  const { progress, isLoading: loadingProgress } = useProgress()
  const { meetings, isLoading: loadingMeetings } = useMeetings('all')

  const watched = progress?.filter((p) => p.lastTimestamp > 0) ?? []
  const totalSeconds = watched.reduce((sum, p) => sum + p.lastTimestamp, 0)
  const completed = watched.filter((p) => p.completed).length
  const liveMeetings = (meetings ?? []).filter((m) => m.status === 'LIVE')
  const upcomingMeetings = (meetings ?? []).filter((m) => m.status === 'SCHEDULED')

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-muted-foreground">Continue where you left off.</p>
      </div>

      <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Courses</CardTitle>
            <BookOpen className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{isLoading ? '—' : courses?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Videos Started</CardTitle>
            <PlayCircle className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{watched.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <TrendingUp className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Time Watched</CardTitle>
            <Clock className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatTotalTime(totalSeconds)}</p>
          </CardContent>
        </Card>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Radio className="size-5 text-primary" />
            Live Meetings
          </h2>
          <Link to="/meeting" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>

        {loadingMeetings ? (
          <Skeleton className="h-24" />
        ) : liveMeetings.length === 0 && upcomingMeetings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="mb-4 text-muted-foreground">No live or upcoming meetings right now.</p>
              <Link to="/meeting/create">
                <Button>
                  <Radio />
                  Schedule a Meeting
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {liveMeetings.slice(0, 3).map((meeting) => (
              <Link key={meeting.id} to={`/meeting/${meeting.id}`}>
                <Card className="h-full transition-colors hover:border-primary/50">
                  <CardContent className="py-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{meeting.title}</p>
                      <Badge className="bg-destructive text-destructive-foreground">Live</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Hosted by {meeting.host.name}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {upcomingMeetings.slice(0, 2).map((meeting) => (
              <Link key={meeting.id} to={`/meeting/${meeting.id}`}>
                <Card className="h-full transition-colors hover:border-primary/50">
                  <CardContent className="py-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{meeting.title}</p>
                      <Badge variant="secondary">Upcoming</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(meeting.scheduledAt)} · {meeting.host.name}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Continue Watching</h2>
          <Link to="/continue-watching" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>

        {loadingProgress ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : watched.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="mb-4 text-muted-foreground">You haven't started any videos yet.</p>
              <Link to="/courses">
                <Button>
                  <PlayCircle />
                  Browse Courses
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {watched.slice(0, 5).map((item) => (
              <ContinueWatchingItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
