import { Link } from 'react-router-dom'
import { useProgress } from '../hooks/useProgress'
import { Card, CardContent } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import { ContinueWatchingItem } from '../components/course/ContinueWatchingItem'

export const ContinueWatchingPage = () => {
  const { progress, isLoading } = useProgress()

  const watched = progress?.filter((p) => p.lastTimestamp > 0) ?? []

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="mb-2 text-3xl font-bold">Continue Watching</h1>
      <p className="mb-8 text-muted-foreground">Pick up right where you left off.</p>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : watched.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No videos in progress yet.{' '}
            <Link to="/courses" className="text-primary hover:underline">
              Browse courses
            </Link>{' '}
            to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {watched.map((item) => (
            <ContinueWatchingItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
