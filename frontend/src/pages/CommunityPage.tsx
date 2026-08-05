import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { ChevronDown, CornerUpLeft, MessageCircle, Send, Trash2, X } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { Avatar } from '../components/ui/avatar'
import { Skeleton } from '../components/ui/skeleton'
import { useAuthStore } from '../store/auth.store'
import { useCommunity } from '../hooks/useCommunity'
import { usePageTitle } from '../hooks/usePageTitle'
import { cn, formatDate, timeAgo } from '../lib/utils'
import type { CommunityMessage } from '../types'
interface BubbleProps {
  message: CommunityMessage
  isMine: boolean
  canDelete: boolean
  onReply: () => void
  onDelete: () => void
}

const Bubble = ({ message, isMine, canDelete, onReply, onDelete }: BubbleProps) => {
  const reply = message.parent

  return (
    <div className={cn('flex w-full gap-2.5', isMine ? 'justify-end' : 'justify-start')}>
      {!isMine && <Avatar name={message.author.name} imageUrl={message.author.profileImageUrl} />}
      <div className="max-w-[80%] sm:max-w-[70%]">
        {!isMine && (
          <p className="mb-1 ml-1.5 flex items-center gap-1.5 text-xs font-semibold text-primary">
            {message.author.name}
            {message.author.role === 'ADMIN' && <Badge variant="secondary">Admin</Badge>}
          </p>
        )}
        <div
          className={cn(
            'rounded-2xl border px-3.5 py-2 shadow-sm',
            isMine
              ? 'rounded-tr-md border-primary-foreground/20 bg-primary text-primary-foreground'
              : 'rounded-tl-md border-border bg-card text-card-foreground',
          )}
        >
          {reply && (
            <div
              className={cn(
                'mb-1.5 rounded-lg border-l-2 px-2 py-1',
                isMine
                  ? 'border-primary-foreground/60 bg-primary-foreground/10'
                  : 'border-primary/50 bg-secondary/60',
              )}
            >
              <p className="truncate text-xs font-semibold">{reply.author.name}</p>
              <p className="truncate text-xs opacity-80">{reply.content}</p>
            </div>
          )}
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.content}</p>
          <p
            className={cn(
              'mt-1 text-right text-[10px] leading-none',
              isMine ? 'text-primary-foreground/70' : 'text-muted-foreground',
            )}
          >
            {timeAgo(message.createdAt)}
          </p>
        </div>
        <div
          className={cn(
            'mt-1 flex items-center gap-0.5',
            isMine ? 'justify-end' : 'justify-start',
          )}
        >
          <button
            onClick={onReply}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <CornerUpLeft className="size-3" />
            Reply
          </button>
          {canDelete && (
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-3" />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export const CommunityPage = () => {
  usePageTitle('Community')
  const user = useAuthStore((s) => s.user)
  const { messages, isLoading, enabled, postMessage, deleteMessage, isPosting } = useCommunity()

  const [content, setContent] = useState('')
  const [replyTo, setReplyTo] = useState<CommunityMessage | null>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(
    () => window.visualViewport?.height ?? window.innerHeight,
  )
  const listRef = useRef<HTMLDivElement>(null)
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const stickToBottom = useRef(true)

  const sorted = useMemo(
    () => [...(messages ?? [])].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [messages],
  )

  const scrollToBottom = useCallback(() => {
    const list = listRef.current
    if (list) list.scrollTo({ top: list.scrollHeight })
  }, [])

  useEffect(() => {
    if (stickToBottom.current) scrollToBottom()
  }, [sorted.length, scrollToBottom])

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const onResize = () => {
      setViewportHeight(vv.height)
      if (stickToBottom.current) scrollToBottom()
    }
    vv.addEventListener('resize', onResize)
    onResize()
    return () => vv.removeEventListener('resize', onResize)
  }, [scrollToBottom])

  const handleScroll = () => {
    const list = listRef.current
    if (!list) return
    const atBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 100
    stickToBottom.current = atBottom
    setShowScrollButton(!atBottom)
  }

  const autoResize = () => {
    const el = composerRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`
  }

  useEffect(() => {
    autoResize()
  }, [content])

  const canDelete = (message: CommunityMessage) =>
    Boolean(user && (user.role === 'ADMIN' || user.id === message.authorId))

  const handleSend = async () => {
    const text = content.trim()
    if (!text || isPosting) return
    stickToBottom.current = true
    await postMessage({ content: text, parentId: replyTo?.id })
    setContent('')
    setReplyTo(null)
    scrollToBottom()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  const handleDelete = async (message: CommunityMessage) => {
    if (!window.confirm('Delete this message? This cannot be undone.')) return
    await deleteMessage(message.id)
  }

  return (
    <div
      className="mx-auto flex max-w-3xl flex-col px-4 pt-6 pb-4 sm:px-6"
      style={{ height: `calc(${viewportHeight}px - 4rem)` }}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-card shadow-lg">
        <header className="flex items-center gap-3 border-b bg-gradient-to-r from-primary/10 via-card to-card px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="relative shrink-0">
            <div className="flex size-11 items-center justify-center rounded-full bg-primary/10">
              <MessageCircle className="size-5 text-primary" />
            </div>
            <span
              className={cn(
                'absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card',
                enabled ? 'bg-emerald-500' : 'bg-destructive',
              )}
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold">Community</h1>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={cn('size-1.5 rounded-full', enabled ? 'bg-emerald-500' : 'bg-destructive')} />
              {enabled ? 'Everyone can chat here' : 'Community is disabled by an administrator'}
            </p>
          </div>
        </header>

        <div
          ref={listRef}
          onScroll={handleScroll}
          className="flex-1 space-y-3 overflow-y-auto bg-muted/30 px-4 py-5"
        >
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={cn('flex gap-2.5', i % 2 === 0 ? 'justify-start' : 'justify-end')}>
                  {i % 2 === 0 && <Skeleton className="size-8 shrink-0 rounded-full" />}
                  <Skeleton className={cn('h-14 rounded-2xl', i % 2 === 0 ? 'w-2/3' : 'w-1/2')} />
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-card shadow-sm">
                <MessageCircle className="size-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">No messages yet</p>
                <p className="text-sm text-muted-foreground">Be the first to say hello.</p>
              </div>
            </div>
          ) : (
            sorted.map((message, index) => {
              const showDate =
                index === 0 || formatDate(sorted[index - 1].createdAt) !== formatDate(message.createdAt)
              const isMine = message.authorId === user?.id
              return (
                <Fragment key={message.id}>
                  {showDate && (
                    <div className="flex justify-center pt-1 pb-2">
                      <span className="rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                  )}
                  <Bubble
                    message={message}
                    isMine={isMine}
                    canDelete={canDelete(message)}
                    onReply={() => setReplyTo(replyTo?.id === message.id ? null : message)}
                    onDelete={() => void handleDelete(message)}
                  />
                </Fragment>
              )
            })
          )}

          {showScrollButton && (
            <div className="sticky bottom-2 z-10 flex justify-end pr-1">
              <button
                onClick={scrollToBottom}
                aria-label="Scroll to latest messages"
                className="flex size-9 items-center justify-center rounded-full border bg-card text-muted-foreground shadow-md transition-colors hover:text-foreground"
              >
                <ChevronDown className="size-4" />
              </button>
            </div>
          )}
        </div>

        <footer className="border-t bg-card p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {replyTo && (
            <div className="mb-2 flex items-center gap-2 rounded-lg border-l-2 border-primary bg-secondary/60 px-3 py-1.5">
              <CornerUpLeft className="size-3.5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">Replying to {replyTo.author.name}</p>
                <p className="truncate text-xs text-muted-foreground">{replyTo.content}</p>
              </div>
              <button
                onClick={() => setReplyTo(null)}
                aria-label="Cancel reply"
                className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void handleSend()
            }}
            className="flex items-end gap-2"
          >
            <Textarea
              ref={composerRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={enabled ? 'Type a message...' : 'Community is disabled'}
              maxLength={2000}
              rows={1}
              disabled={!enabled}
              style={{ minHeight: '44px' }}
              className="max-h-32 resize-none rounded-2xl disabled:opacity-60"
            />
            <Button
              type="submit"
              size="icon"
              className="size-11 shrink-0 rounded-full"
              disabled={!content.trim() || isPosting || !enabled}
              aria-label="Send message"
            >
              <Send />
            </Button>
          </form>
        </footer>
      </div>
    </div>
  )
}
