import { useEffect, useRef, useState } from 'react'
import { useChat } from '@livekit/components-react'
import { Send } from 'lucide-react'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import type { MeetingChatMessage } from '../../../types'
import { meetingService } from '../../../services/meeting.service'

interface ChatPanelProps {
  meetingId: string
}

export const ChatPanel = ({ meetingId }: ChatPanelProps) => {
  const { chatMessages, send, isSending } = useChat()
  const [history, setHistory] = useState<MeetingChatMessage[]>([])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    meetingService
      .chat(meetingId)
      .then(({ data }) => {
        if (!cancelled) setHistory(data.data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [meetingId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history.length, chatMessages.length])

  const handleSend = async () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    send(text).catch(() => {})
    meetingService.sendChat(meetingId, text).catch(() => {})
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b px-4 py-3">
        <h3 className="font-semibold">Chat</h3>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {history.map((msg) => (
          <div key={msg.id} className="space-y-0.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-semibold">{msg.name}</span>
              <span className="text-[10px] text-muted-foreground">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-sm break-words">{msg.message}</p>
          </div>
        ))}

        {chatMessages.map((msg) => (
          <div key={msg.id ?? msg.timestamp} className="space-y-0.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-semibold">{msg.from?.name ?? 'Guest'}</span>
              <span className="text-[10px] text-muted-foreground">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-sm break-words">{msg.message}</p>
          </div>
        ))}

        {history.length === 0 && chatMessages.length === 0 && (
          <p className="pt-8 text-center text-xs text-muted-foreground">No messages yet. Say hello!</p>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 border-t p-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Type a message…"
          className="h-9"
        />
        <Button size="icon" onClick={handleSend} disabled={isSending || !input.trim()}>
          <Send />
        </Button>
      </div>
    </div>
  )
}
