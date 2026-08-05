import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateCommunityMessagePayload } from '../services/community.service'
import { communityService } from '../services/community.service'
import { useToast } from '../components/ui/toast-context'
import { getErrorMessage } from '../lib/utils'

export const useCommunity = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const listQuery = useQuery({
    queryKey: ['community'],
    queryFn: async () => {
      const { data } = await communityService.list()
      return data.data
    },
    refetchInterval: 4000,
  })

  const settingsQuery = useQuery({
    queryKey: ['community', 'settings'],
    queryFn: async () => {
      const { data } = await communityService.settings()
      return data.data
    },
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateCommunityMessagePayload) => communityService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community'] })
    },
    onError: (error) => {
      toast({
        title: 'Could not post message',
        description: getErrorMessage(error),
        variant: 'error',
      })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => communityService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community'] })
      toast({ title: 'Message deleted', variant: 'success' })
    },
    onError: (error) => {
      toast({
        title: 'Could not delete message',
        description: getErrorMessage(error),
        variant: 'error',
      })
    },
  })

  return {
    messages: listQuery.data,
    isLoading: listQuery.isLoading,
    enabled: settingsQuery.data?.enabled ?? true,
    isSettingsLoading: settingsQuery.isLoading,
    postMessage: createMutation.mutateAsync,
    deleteMessage: removeMutation.mutateAsync,
    isPosting: createMutation.isPending,
  }
}
