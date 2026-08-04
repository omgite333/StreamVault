import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { progressService, type ProgressPayload } from '../services/progress.service'
import type { Progress } from '../types'

export const useProgress = () => {
  const queryClient = useQueryClient()

  const listQuery = useQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      const { data } = await progressService.get()
      return data.data
    },
  })

  const updateMutation = useMutation({
    mutationFn: (payload: ProgressPayload) => progressService.update(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['progress'] })
      const previous = queryClient.getQueryData<Progress[]>(['progress'])
      queryClient.setQueryData<Progress[]>(['progress'], (old) =>
        (old ?? []).map((item) =>
          item.videoId === payload.videoId
            ? {
                ...item,
                lastTimestamp: payload.lastTimestamp,
                completed: payload.completed ?? item.completed,
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      )
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(['progress'], context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['progress'] }),
  })

  return {
    progress: listQuery.data,
    isLoading: listQuery.isLoading,
    updateProgress: updateMutation.mutate,
    saveProgress: updateMutation.mutateAsync,
    isSaving: updateMutation.isPending,
  }
}
