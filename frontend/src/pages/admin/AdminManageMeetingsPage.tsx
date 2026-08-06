import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Calendar, Trash2, Video } from 'lucide-react'
import { meetingService } from '../../services/meeting.service'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import { useToast } from '../../components/ui/toast-context'
import { usePageTitle } from '../../hooks/usePageTitle'
import { getErrorMessage } from '../../lib/utils'
import type { Meeting } from '../../types'

const statusBadge: Record<Meeting['status'], { label: string; className: string }> = {
  LIVE: { label: 'Live', className: 'bg-destructive text-destructive-foreground' },
  SCHEDULED: { label: 'Scheduled', className: 'bg-secondary text-secondary-foreground' },
  ENDED: { label: 'Ended', className: 'bg-muted text-muted-foreground' },
}

export const AdminManageMeetingsPage = () => {
  usePageTitle('Meeting Management')
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const meetingsQuery = useQuery({
    queryKey: ['admin', 'meetings'],
    queryFn: async () => (await meetingService.list('all')).data.data,
    refetchInterval: 15000,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => meetingService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'meetings'] })
      toast({ title: 'Meeting deleted', variant: 'success' })
    },
    onError: (error) => {
      toast({ title: 'Could not delete meeting', description: getErrorMessage(error), variant: 'error' })
    },
  })

  const confirmDelete = (meeting: Meeting) => {
    if (!window.confirm(`Delete "${meeting.title}" and all of its data? This cannot be undone.`)) return
    deleteMutation.mutate(meeting.id)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meeting Management</h1>
        <p className="text-muted-foreground">Review and moderate all live meetings on the platform.</p>
      </div>

      {meetingsQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (meetingsQuery.data ?? []).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
              <Video className="size-6 text-primary" />
            </div>
            <p className="font-medium">No meetings yet</p>
            <p className="text-sm text-muted-foreground">Meetings will appear here once members schedule them.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {(meetingsQuery.data ?? []).map((meeting) => {
            const status = statusBadge[meeting.status]
            return (
              <Card key={meeting.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Calendar className="size-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link to={`/meeting/${meeting.id}`} className="font-medium hover:underline">
                          {meeting.title}
                        </Link>
                        <Badge className={status.className}>{status.label}</Badge>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        Hosted by {meeting.host.name} · {new Date(meeting.scheduledAt).toLocaleString()} ·{' '}
                        {meeting._count?.participants ?? 0} participant(s) · Code {meeting.joinCode}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    disabled={deleteMutation.isPending}
                    onClick={() => confirmDelete(meeting)}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
