import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { commentService } from '../services/comment.service'
import { useToast } from '../components/ui/toast-context'
import { getErrorMessage } from '../lib/utils'

export const useComments = (videoId: string) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const queryKey = ['comments', videoId]

  const listQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await commentService.list(videoId)
      return data.data
    },
    enabled: Boolean(videoId),
  })

  const createMutation = useMutation({
    mutationFn: (content: string) => commentService.create(videoId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
    onError: (error) => {
      toast({
        title: 'Could not post comment',
        description: getErrorMessage(error),
        variant: 'error',
      })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (commentId: string) => commentService.remove(videoId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      toast({ title: 'Comment deleted', variant: 'success' })
    },
    onError: (error) => {
      toast({
        title: 'Could not delete comment',
        description: getErrorMessage(error),
        variant: 'error',
      })
    },
  })

  return {
    comments: listQuery.data,
    isLoading: listQuery.isLoading,
    postComment: createMutation.mutateAsync,
    deleteComment: removeMutation.mutateAsync,
    isPosting: createMutation.isPending,
  }
}
