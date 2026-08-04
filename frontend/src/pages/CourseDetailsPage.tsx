import { Link, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { useCourse } from '../hooks/useCourse'
import { useAuth } from '../hooks/useAuth'
import { uploadService } from '../services/upload.service'
import { videoService } from '../services/video.service'
import { VideoGridCard } from '../components/course/VideoGridCard'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import { useToast } from '../components/ui/toast-context'
import { usePageTitle } from '../hooks/usePageTitle'
import { getErrorMessage } from '../lib/utils'
import type { Video } from '../types'

export const CourseDetailsPage = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const { data: course, isLoading } = useCourse(courseId)
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  usePageTitle(course?.title)

  const canEdit = user?.role === 'ADMIN'

  const handleThumbnail = async (video: Video, file: File) => {
    try {
      const fileType = file.type || 'image/png'
      const { data } = await uploadService.getUploadUrl({ fileType, folder: 'thumbnails' })
      const { url, key } = data.data
      const response = await uploadService.putObject(url, file, fileType)
      if (!response.ok) {
        throw new Error('Thumbnail upload failed.')
      }
      await videoService.update(video.id, { thumbnail: key })
      queryClient.invalidateQueries({ queryKey: ['course', courseId] })
      toast({ title: 'Thumbnail updated', variant: 'success' })
    } catch (error) {
      toast({ title: 'Could not update thumbnail', description: getErrorMessage(error), variant: 'error' })
    }
  }

  const handleRemove = async (video: Video) => {
    try {
      await videoService.remove(video.id)
      queryClient.invalidateQueries({ queryKey: ['course', courseId] })
      toast({ title: 'Video removed', variant: 'success' })
    } catch (error) {
      toast({ title: 'Could not remove video', description: getErrorMessage(error), variant: 'error' })
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <Skeleton className="mb-6 h-10 w-2/3" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video rounded-3xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!course) {
    return <p className="py-16 text-center text-muted-foreground">Course not found.</p>
  }

  const totalVideos =
    course.videos.length + course.sections.reduce((sum, s) => sum + (s.videos?.length ?? 0), 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/courses" className="transition-colors hover:text-foreground">
          Courses
        </Link>
        <ChevronRight className="size-4" />
        <span className="truncate text-foreground">{course.title}</span>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{course.title}</h1>
        <Badge variant="secondary" className="shrink-0">
          {totalVideos} {totalVideos === 1 ? 'video' : 'videos'}
        </Badge>
      </div>

      {course.videos.length === 0 && course.sections.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          This course doesn't have any videos yet.
        </p>
      ) : (
        <div className="space-y-8">
          {course.videos.length > 0 && (
            <section>
              <h2 className="font-display mb-4 text-xl font-bold tracking-tight">Lessons</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {course.videos.map((video) => (
                  <VideoGridCard
                    key={video.id}
                    video={video}
                    courseId={course.id}
                    canEdit={canEdit}
                    onThumbnail={handleThumbnail}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </section>
          )}
          {course.sections.map((section) => (
            <section key={section.id}>
              <h2 className="font-display mb-4 text-xl font-bold tracking-tight">{section.title}</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {section.videos?.map((video) => (
                  <VideoGridCard
                    key={video.id}
                    video={video}
                    courseId={course.id}
                    canEdit={canEdit}
                    onThumbnail={handleThumbnail}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
