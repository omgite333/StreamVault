import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CornerUpLeft, MessageCircle, MessagesSquare, Power, Trash2 } from 'lucide-react'
import { adminService } from '../../services/admin.service'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import { Avatar } from '../../components/ui/avatar'
import { cn, getErrorMessage, timeAgo } from '../../lib/utils'
import { useToast } from '../../components/ui/toast-context'
import { usePageTitle } from '../../hooks/usePageTitle'
import type { CommunityMessage, VideoComment } from '../../types'

type Tab = 'messages' | 'comments'

const DeleteButton = ({ onDelete, isPending }: { onDelete: () => void; isPending: boolean }) => (
  <Button
    variant="outline"
    size="sm"
    disabled={isPending}
    onClick={onDelete}
    className="shrink-0 text-muted-foreground hover:text-destructive"
  >
    <Trash2 className="size-4" />
    Delete
  </Button>
)

export const ManageCommunityPage = () => {
  usePageTitle('Community Management')
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [tab, setTab] = useState<Tab>('messages')

  const settingsQuery = useQuery({
    queryKey: ['admin', 'community', 'settings'],
    queryFn: async () => (await adminService.getCommunitySettings()).data.data,
  })

  const messagesQuery = useQuery({
    queryKey: ['admin', 'community', 'messages'],
    queryFn: async () => (await adminService.getCommunityMessages()).data.data,
  })

  const commentsQuery = useQuery({
    queryKey: ['admin', 'community', 'comments'],
    queryFn: async () => (await adminService.getCommunityComments()).data.data,
  })

  const settingsMutation = useMutation({
    mutationFn: (enabled: boolean) => adminService.updateCommunitySettings(enabled),
    onSuccess: (_, enabled) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'community', 'settings'] })
      toast({
        title: enabled ? 'Community enabled' : 'Community disabled',
        description: enabled ? 'Members can chat again.' : 'Members can no longer post new messages.',
        variant: 'success',
      })
    },
    onError: (error) => {
      toast({ title: 'Could not update community', description: getErrorMessage(error), variant: 'error' })
    },
  })

  const messageDeleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteCommunityMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'community', 'messages'] })
      toast({ title: 'Message deleted', variant: 'success' })
    },
    onError: (error) => {
      toast({ title: 'Could not delete message', description: getErrorMessage(error), variant: 'error' })
    },
  })

  const commentDeleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteCommunityComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'community', 'comments'] })
      toast({ title: 'Comment deleted', variant: 'success' })
    },
    onError: (error) => {
      toast({ title: 'Could not delete comment', description: getErrorMessage(error), variant: 'error' })
    },
  })

  const toggleEnabled = () => {
    settingsMutation.mutate(!settingsQuery.data?.enabled)
  }

  const confirmDeleteMessage = (message: CommunityMessage) => {
    if (!window.confirm(`Delete message from ${message.author.name}? This cannot be undone.`)) return
    messageDeleteMutation.mutate(message.id)
  }

  const confirmDeleteComment = (comment: VideoComment) => {
    if (!window.confirm(`Delete comment from ${comment.author.name}? This cannot be undone.`)) return
    commentDeleteMutation.mutate(comment.id)
  }

  const enabled = settingsQuery.data?.enabled ?? true

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Community Management</h1>
        <p className="text-muted-foreground">Control the community chat and moderate messages and comments.</p>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <Power className="size-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Community chat</p>
              <p className="text-sm text-muted-foreground">
                {enabled
                  ? 'Enabled — members can send messages.'
                  : 'Disabled — members can read but not post.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={enabled ? 'default' : 'secondary'}>{enabled ? 'Enabled' : 'Disabled'}</Badge>
            <Button
              variant={enabled ? 'destructive' : 'default'}
              size="sm"
              disabled={settingsMutation.isPending}
              onClick={toggleEnabled}
            >
              {enabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          variant={tab === 'messages' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTab('messages')}
        >
          <MessageCircle className="size-4" />
          Messages
          <Badge variant="secondary" className="ml-1">
            {messagesQuery.data?.length ?? 0}
          </Badge>
        </Button>
        <Button
          variant={tab === 'comments' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTab('comments')}
        >
          <MessagesSquare className="size-4" />
          Comments
          <Badge variant="secondary" className="ml-1">
            {commentsQuery.data?.length ?? 0}
          </Badge>
        </Button>
      </div>

      {tab === 'messages' ? (
        messagesQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : (messagesQuery.data ?? []).length === 0 ? (
          <EmptyState icon={MessageCircle} title="No messages yet" description="Messages will appear here once members start chatting." />
        ) : (
          <div className="space-y-3">
            {(messagesQuery.data ?? []).map((message) => (
              <Card key={message.id}>
                <CardContent className="flex items-start justify-between gap-4 py-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <Avatar name={message.author.name} imageUrl={message.author.profileImageUrl} className="size-10" />
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-semibold">{message.author.name}</span>
                        {message.author.role === 'ADMIN' && <Badge variant="secondary">Admin</Badge>}
                        <span className="text-xs text-muted-foreground">{timeAgo(message.createdAt)}</span>
                      </p>
                      {message.parent && (
                        <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                          <CornerUpLeft className="size-3 shrink-0" />
                          <span className="truncate">
                            Reply to {message.parent.author.name}: {message.parent.content}
                          </span>
                        </p>
                      )}
                      <p className="mt-1 break-words text-sm text-card-foreground">{message.content}</p>
                    </div>
                  </div>
                  <DeleteButton
                    onDelete={() => confirmDeleteMessage(message)}
                    isPending={messageDeleteMutation.isPending}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : commentsQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (commentsQuery.data ?? []).length === 0 ? (
        <EmptyState icon={MessagesSquare} title="No comments yet" description="Comments on videos will appear here." />
      ) : (
        <div className="space-y-3">
          {(commentsQuery.data ?? []).map((comment) => (
            <Card key={comment.id}>
              <CardContent className="flex items-start justify-between gap-4 py-4">
                <div className="flex min-w-0 items-start gap-3">
                  <Avatar name={comment.author.name} imageUrl={comment.author.profileImageUrl} className="size-10" />
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-semibold">{comment.author.name}</span>
                      {comment.author.role === 'ADMIN' && <Badge variant="secondary">Admin</Badge>}
                      <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
                    </p>
                    <p className="mt-1 break-words text-sm text-card-foreground">{comment.content}</p>
                    <p className={cn('mt-1 truncate text-xs text-muted-foreground')}>
                      On: {comment.video?.title ?? 'Unknown video'}
                    </p>
                  </div>
                </div>
                <DeleteButton
                  onDelete={() => confirmDeleteComment(comment)}
                  isPending={commentDeleteMutation.isPending}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

const EmptyState = ({ icon: Icon, title, description }: { icon: typeof MessageCircle; title: string; description: string }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border py-12 text-center">
    <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
      <Icon className="size-6 text-primary" />
    </div>
    <div>
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
)
