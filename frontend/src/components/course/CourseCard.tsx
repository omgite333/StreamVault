import { Link } from 'react-router-dom'
import { ArrowUpRight, PlayCircle } from 'lucide-react'
import { Card } from '../ui/card'
import type { Course } from '../../types'

interface CourseCardProps {
  course: Course
}

export const CourseCard = ({ course }: CourseCardProps) => {
  const videoCount = course._count?.videos ?? 0

  return (
    <Link to={`/courses/${course.id}`} className="block h-full">
      <Card className="group flex h-full flex-col justify-between p-6 transition-colors hover:border-primary/50">
        <div>
          <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <PlayCircle className="size-5" />
          </div>
          <p className="font-display text-lg font-semibold leading-snug">{course.title}</p>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {videoCount} {videoCount === 1 ? 'video' : 'videos'}
          </span>
          <ArrowUpRight className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
        </div>
      </Card>
    </Link>
  )
}
