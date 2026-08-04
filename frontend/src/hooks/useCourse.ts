import { useQuery } from '@tanstack/react-query'
import { courseService } from '../services/course.service'

export const useCourse = (id: string | undefined) =>
  useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const { data } = await courseService.get(id!)
      return data.data
    },
    enabled: Boolean(id),
  })
