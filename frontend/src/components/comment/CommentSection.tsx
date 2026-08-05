import { useState, type FormEvent } from 'react'
import { MessageSquare, Send, Trash2 } from 'lucide-react'
import { Avatar } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Skeleton } from '../ui/skeleton'
import { useAuthStore } from '../../store/auth.store'
import { useComments } from '../../hooks/useComments'
import { timeAgo } from '../../lib/utils'
import type { VideoComment } from '../../types'

export const CommentSection = ({ videoId }: { videoId: string }) => {
  const user = useAuthStore((s) => s.user)
  const { comments, isLoading, postComment, deleteComment, isPosting } = useComments(videoId)
  const [content, setContent] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const text = content.trim()
    if (!text || isPosting) return
    await postComment(text)
    setContent('')
  }

  const handleDelete = async (comment: VideoComment) => {
    if (!window.confirm('Delete this comment? This cannot be undone.')) return
    await deleteComment(comment.id)
  }

  const canDelete = (comment: VideoComment) =>
    Boolean(user && (user.role === 'ADMIN' || user.id === comment.authorId))

  return (
    <section className="mt-8">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold">
        <MessageSquare className="size-4 text-primary" />
        Comments ({comments?.length ?? 0})
      </h2>

      <form onSubmit={handleSubmit} className="mb-6 flex items-start gap-3">
        <Avatar name={user?.name ?? 'You'} imageUrl={user?.profileImageUrl} />
        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment..."
            maxLength={2000}
            rows={2}
          />
          <div className="mt-2 flex justify-end">
            <Button type="submit" size="sm" disabled={!content.trim() || isPosting}>
              <Send />
              Comment
            </Button>
          </div>
        </div>
      </form>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (comments?.length ?? 0) === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet. Start the discussion!</p>
      ) : (
        <div className="space-y-4">
          {comments?.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar name={comment.author.name} imageUrl={comment.author.profileImageUrl} />
              <div className="flex-1 rounded-xl border bg-card px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{comment.author.name}</span>
                  {comment.author.role === 'ADMIN' && <Badge variant="secondary">Admin</Badge>}
                  <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
                  {canDelete(comment) && (
                    <button
                      onClick={() => void handleDelete(comment)}
                      className="ml-auto inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-3" />
                      Delete
                    </button>
                  )}
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
