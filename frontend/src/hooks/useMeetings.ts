import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  CreateMeetingPayload,
  LeaveMeetingPayload,
  MeetingFilter,
} from '../services/meeting.service'
import { meetingService } from '../services/meeting.service'
import { getStoredJoinToken, storeJoinToken } from '../services/meeting.service'
import { useToast } from '../components/ui/toast-context'
import { getErrorMessage } from '../lib/utils'

export const useMeetings = (filter: MeetingFilter = 'all') => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const listQuery = useQuery({
    queryKey: ['meetings', filter],
    queryFn: async () => {
      const { data } = await meetingService.list(filter)
      return data.data
    },
    refetchInterval: filter === 'live' ? 10000 : 30000,
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateMeetingPayload) => meetingService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
    },
    onError: (error) => {
      toast({
        title: 'Could not create meeting',
        description: getErrorMessage(error),
        variant: 'error',
      })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => meetingService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
      toast({ title: 'Meeting deleted', variant: 'success' })
    },
    onError: (error) => {
      toast({
        title: 'Could not delete meeting',
        description: getErrorMessage(error),
        variant: 'error',
      })
    },
  })

  const startMutation = useMutation({
    mutationFn: (id: string) => meetingService.start(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
      toast({ title: 'Meeting started', variant: 'success' })
    },
    onError: (error) => {
      toast({
        title: 'Could not start meeting',
        description: getErrorMessage(error),
        variant: 'error',
      })
    },
  })

  const endMutation = useMutation({
    mutationFn: (id: string) => meetingService.end(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
      toast({ title: 'Meeting ended', variant: 'success' })
    },
    onError: (error) => {
      toast({
        title: 'Could not end meeting',
        description: getErrorMessage(error),
        variant: 'error',
      })
    },
  })

  return {
    meetings: listQuery.data,
    isLoading: listQuery.isLoading,
    createMeeting: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteMeeting: removeMutation.mutateAsync,
    isDeleting: removeMutation.isPending,
    startMeeting: startMutation.mutateAsync,
    isStarting: startMutation.isPending,
    endMeeting: endMutation.mutateAsync,
  }
}

export const useMeeting = (id: string) => {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const meetingQuery = useQuery({
    queryKey: ['meetings', id],
    queryFn: async () => {
      const { data } = await meetingService.get(id)
      return data.data
    },
    refetchInterval: 30000,
  })

  const joinQuery = useQuery({
    queryKey: ['meetings', id, 'join'],
    queryFn: async () => {
      const stored = getStoredJoinToken(id)
      if (stored) return stored
      const { data } = await meetingService.join(id)
      storeJoinToken(id, data.data)
      return data.data
    },
    retry: 1,
  })

  const startMutation = useMutation({
    mutationFn: (meetingId: string) => meetingService.start(meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings', id] })
      queryClient.invalidateQueries({ queryKey: ['meetings', id, 'join'] })
      toast({ title: 'Meeting started', variant: 'success' })
    },
    onError: (error) => {
      toast({
        title: 'Could not start meeting',
        description: getErrorMessage(error),
        variant: 'error',
      })
    },
  })

  const endMutation = useMutation({
    mutationFn: (meetingId: string) => meetingService.end(meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
      toast({ title: 'Meeting ended', variant: 'success' })
    },
    onError: (error) => {
      toast({
        title: 'Could not end meeting',
        description: getErrorMessage(error),
        variant: 'error',
      })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (meetingId: string) => meetingService.remove(meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
      toast({ title: 'Meeting deleted', variant: 'success' })
    },
    onError: (error) => {
      toast({
        title: 'Could not delete meeting',
        description: getErrorMessage(error),
        variant: 'error',
      })
    },
  })

  const leaveMutation = useMutation({
    mutationFn: (payload: LeaveMeetingPayload) => meetingService.leave(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
    },
    onError: (error) => {
      toast({
        title: 'Could not leave meeting',
        description: getErrorMessage(error),
        variant: 'error',
      })
    },
  })

  const kickMutation = useMutation({
    mutationFn: (identity: string) => meetingService.kick(id, identity),
    onError: (error) => {
      toast({
        title: 'Could not remove participant',
        description: getErrorMessage(error),
        variant: 'error',
      })
    },
  })

  const recordStartMutation = useMutation({
    mutationFn: () => meetingService.startRecording(id),
    onError: (error) => {
      toast({
        title: 'Could not start recording',
        description: getErrorMessage(error),
        variant: 'error',
      })
    },
  })

  const recordStopMutation = useMutation({
    mutationFn: () => meetingService.stopRecording(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings', id] })
      toast({ title: 'Recording saved', variant: 'success' })
    },
    onError: (error) => {
      toast({
        title: 'Could not stop recording',
        description: getErrorMessage(error),
        variant: 'error',
      })
    },
  })

  return {
    meeting: meetingQuery.data,
    meetingLoading: meetingQuery.isLoading,
    joinData: joinQuery.data,
    joinLoading: joinQuery.isLoading,
    refetchJoin: joinQuery.refetch,
    startMeeting: startMutation.mutateAsync,
    isStarting: startMutation.isPending,
    endMeeting: endMutation.mutateAsync,
    isEnding: endMutation.isPending,
    leaveMeeting: leaveMutation.mutateAsync,
    isLeaving: leaveMutation.isPending,
    deleteMeeting: removeMutation.mutateAsync,
    isDeleting: removeMutation.isPending,
    kickParticipant: kickMutation.mutateAsync,
    isKicking: kickMutation.isPending,
    startRecording: recordStartMutation.mutateAsync,
    isRecording: recordStartMutation.isPending,
    stopRecording: recordStopMutation.mutateAsync,
    isStoppingRecording: recordStopMutation.isPending,
  }
}
