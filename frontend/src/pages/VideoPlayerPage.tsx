import { useParams } from 'react-router-dom'
import { Download } from 'lucide-react'
import { useVideo } from '../hooks/useVideo'
import { useCourse } from '../hooks/useCourse'
import { useProgress } from '../hooks/useProgress'
import { VideoPlayer } from '../components/video/VideoPlayer'
import { VideoCard } from '../components/course/VideoCard'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { usePageTitle } from '../hooks/usePageTitle'

export const VideoPlayerPage = () => {
  const { courseId, videoId } = useParams<{ courseId: string; videoId: string }>()
  const { data: video, isLoading } = useVideo(videoId ?? '')
  const { data: course } = useCourse(courseId)
  const { progress } = useProgress()
  usePageTitle(video?.title)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Skeleton className="aspect-video w-full" />
      </div>
    )
  }

  if (!video) {
    return <p className="py-16 text-center text-muted-foreground">Video not found.</p>
  }

  const saved = progress?.find((p) => p.videoId === video.id)
  const allVideos = [...(course?.videos ?? []), ...(course?.sections.flatMap((s) => s.videos ?? []) ?? [])]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <VideoPlayer
            src={video.streamUrl}
            videoId={video.id}
            initialTime={saved?.lastTimestamp}
            allowDownload={video.allowDownload}
            poster={video.thumbnailUrl}
          />
          <div className="mt-4">
            <h1 className="text-xl font-bold">{video.title}</h1>
            {video.description && <p className="mt-1 text-sm text-muted-foreground">{video.description}</p>}
            {video.allowDownload && video.streamUrl && (
              <a href={video.streamUrl} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm" className="mt-3">
                  <Download />
                  Download Video
                </Button>
              </a>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto lg:pb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Course content
          </h2>
          <div className="space-y-1">
            {allVideos.map((v) => (
              <VideoCard key={v.id} video={v} courseId={course?.id ?? ''} isActive={v.id === video.id} />
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
