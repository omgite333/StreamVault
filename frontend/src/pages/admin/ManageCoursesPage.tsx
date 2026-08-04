import { Link } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useCourses } from '../../hooks/useCourses'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import { formatDate } from '../../lib/utils'

export const ManageCoursesPage = () => {
  const { courses, isLoading, deleteCourse, isDeleting } = useCourses()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Courses</h1>
          <p className="text-muted-foreground">Create, edit, and delete courses.</p>
        </div>
        <Link to="/admin/courses/new">
          <Button>
            <Plus />
            New Course
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (courses ?? []).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No courses yet. Create your first course.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {courses?.map((course) => (
            <Card key={course.id}>
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{course.title}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {course._count?.videos ?? 0} videos · Created {formatDate(course.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link to={`/courses/${course.id}`}>
                    <Button variant="ghost" size="sm">
                      <Pencil />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => {
                      if (window.confirm(`Delete "${course.title}"? This cannot be undone.`)) {
                        deleteCourse(course.id)
                      }
                    }}
                  >
                    <Trash2 />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
