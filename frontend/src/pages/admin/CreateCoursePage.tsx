import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Spinner } from '../../components/ui/spinner'
import { Textarea } from '../../components/ui/textarea'
import { useCourses } from '../../hooks/useCourses'
import { createCourseSchema, type CreateCourseInput } from '../../validations/course'

export const CreateCoursePage = () => {
  const { createCourse, isCreating } = useCourses()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCourseInput>({
    resolver: zodResolver(createCourseSchema),
  })

  const onSubmit = async (values: CreateCourseInput) => {
    await createCourse(values)
    navigate('/admin/courses')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Course</h1>
        <p className="text-muted-foreground">Add a new course to your catalog.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" placeholder="e.g. React for Beginners" {...register('title')} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={5}
            placeholder="What will students learn in this course?"
            {...register('description')}
          />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isCreating}>
            {isCreating && <Spinner />}
            Create Course
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/courses')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
