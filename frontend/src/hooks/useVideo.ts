import { useQuery } from '@tanstack/react-query'
import { videoService } from '../services/video.service'

export const useVideo = (id: string) =>
  useQuery({
    queryKey: ['video', id],
    queryFn: async () => {
      const { data } = await videoService.get(id)
      return data.data
    },
    enabled: Boolean(id),
    retry: false,
  })
