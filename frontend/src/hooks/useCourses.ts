import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { courseService, type CoursePayload } from '../services/course.service'
import { useToast } from '../components/ui/toast-context'
import { getErrorMessage } from '../lib/utils'

export const useCourses = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const listQuery = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data } = await courseService.list()
      return data.data
    },
  })

  const createMutation = useMutation({
    mutationFn: (payload: CoursePayload) => courseService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      toast({ title: 'Course created', variant: 'success' })
    },
    onError: (error) => {
      toast({ title: 'Could not create course', description: getErrorMessage(error), variant: 'error' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CoursePayload> }) =>
      courseService.update(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      queryClient.invalidateQueries({ queryKey: ['course', id] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => courseService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      toast({ title: 'Course deleted', variant: 'success' })
    },
    onError: (error) => {
      toast({ title: 'Could not delete course', description: getErrorMessage(error), variant: 'error' })
    },
  })

  return {
    courses: listQuery.data,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    createCourse: createMutation.mutateAsync,
    updateCourse: updateMutation.mutateAsync,
    deleteCourse: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
