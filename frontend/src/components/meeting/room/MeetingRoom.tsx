import { useCallback, useEffect, useRef, useState } from 'react'
import { Track } from 'livekit-client'
import { PenLine, MessageSquare, Users } from 'lucide-react'
import {
  useDataChannel,
  useLocalParticipant,
  useParticipants,
  useTracks,
} from '@livekit/components-react'
import { Badge } from '../../ui/badge'
import { ControlBar } from './ControlBar'
import { ChatPanel } from './ChatPanel'
import { ParticipantsPanel, type RaisedHand } from './ParticipantsPanel'
import { ParticipantVideoTile } from './ParticipantVideoTile'
import { WhiteboardPanel, type WhiteboardStroke } from './WhiteboardPanel'
import { cn } from '../../../lib/utils'
import type { Meeting, MeetingRole } from '../../../types'

const RAISE_HAND_TOPIC = 'raise-hand'
const MUTE_ALL_TOPIC = 'host-mute-all'
const WHITEBOARD_TOPIC = 'whiteboard'

const encode = (data: unknown) => new TextEncoder().encode(JSON.stringify(data))

type WhiteboardMessage =
  | { kind: 'stroke'; stroke: WhiteboardStroke }
  | { kind: 'clear' }
  | { kind: 'sync-request' }
  | { kind: 'sync'; strokes: WhiteboardStroke[] }

interface MeetingRoomProps {
  meeting: Meeting
  isHost: boolean
  localRole: MeetingRole
  isEnding?: boolean
  isLeaving?: boolean
  onLeave: () => Promise<void>
  onStartRecording: () => void
  onStopRecording: () => void
  onKick: (identity: string) => void
}

export const MeetingRoom = ({
  meeting,
  isHost,
  localRole,
  isEnding = false,
  isLeaving = false,
  onLeave,
  onStartRecording,
  onStopRecording,
  onKick,
}: MeetingRoomProps) => {
  const [panel, setPanel] = useState<'participants' | 'chat' | 'whiteboard' | null>('participants')
  const [raisedHands, setRaisedHands] = useState<Record<string, RaisedHand>>({})
  const [strokes, setStrokes] = useState<WhiteboardStroke[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const { localParticipant } = useLocalParticipant()
  const participants = useParticipants()
  const raisedRef = useRef(false)
  const strokesRef = useRef<WhiteboardStroke[]>([])

  const sendWhiteboard = useDataChannel(WHITEBOARD_TOPIC).send

  const updateStrokes = useCallback((updater: (prev: WhiteboardStroke[]) => WhiteboardStroke[]) => {
    setStrokes((prev) => {
      const next = updater(prev)
      strokesRef.current = next
      return next
    })
  }, [])

  const onData = useCallback(
    (msg: { topic?: string; payload: Uint8Array; from?: { identity: string; name?: string } }) => {
      if (msg.topic === WHITEBOARD_TOPIC) {
        let message: WhiteboardMessage
        try {
          message = JSON.parse(new TextDecoder().decode(msg.payload)) as WhiteboardMessage
        } catch {
          return
        }
        if (message.kind === 'stroke') {
          updateStrokes((prev) =>
            prev.some((s) => s.id === message.stroke.id) ? prev : [...prev, message.stroke],
          )
        } else if (message.kind === 'clear') {
          updateStrokes(() => [])
        } else if (message.kind === 'sync-request') {
          if (strokesRef.current.length > 0) {
            sendWhiteboard(encode({ kind: 'sync', strokes: strokesRef.current }), {
              reliable: true,
              topic: WHITEBOARD_TOPIC,
            })
          }
        } else if (message.kind === 'sync') {
          updateStrokes((prev) => {
            const known = new Set(prev.map((s) => s.id))
            const fresh = message.strokes.filter((s) => !known.has(s.id))
            return fresh.length > 0 ? [...prev, ...fresh] : prev
          })
        }
        return
      }

      if (msg.topic === RAISE_HAND_TOPIC) {
        const from = msg.from?.identity
        if (!from) return
        let raised = false
        try {
          raised = JSON.parse(new TextDecoder().decode(msg.payload)).raised === true
        } catch {
          return
        }
        setRaisedHands((prev) => ({ ...prev, [from]: { name: msg.from?.name ?? 'Unknown', raised } }))
      } else if (msg.topic === MUTE_ALL_TOPIC) {
        localParticipant.setMicrophoneEnabled(false)
      }
    },
    [localParticipant, sendWhiteboard, updateStrokes],
  )

  useDataChannel(onData)

  const sendRaiseHand = useDataChannel(RAISE_HAND_TOPIC).send
  const sendMuteAll = useDataChannel(MUTE_ALL_TOPIC).send

  useEffect(() => {
    const timer = window.setTimeout(() => {
      sendWhiteboard(encode({ kind: 'sync-request' }), { reliable: true, topic: WHITEBOARD_TOPIC })
    }, 800)
    return () => window.clearTimeout(timer)
  }, [sendWhiteboard])

  const toggleRaiseHand = () => {
    raisedRef.current = !raisedRef.current
    sendRaiseHand(encode({ raised: raisedRef.current }), { reliable: true, topic: RAISE_HAND_TOPIC })
    setRaisedHands((prev) => ({
      ...prev,
      [localParticipant.identity]: { name: localParticipant.name ?? 'You', raised: raisedRef.current },
    }))
  }

  const muteAll = () => {
    sendMuteAll(encode({}), { reliable: true, topic: MUTE_ALL_TOPIC })
  }

  const toggleRecording = () => {
    if (isRecording) {
      onStopRecording()
      setIsRecording(false)
    } else {
      onStartRecording()
      setIsRecording(true)
    }
  }

  const addStroke = useCallback(
    (stroke: WhiteboardStroke) => {
      updateStrokes((prev) => (prev.some((s) => s.id === stroke.id) ? prev : [...prev, stroke]))
      sendWhiteboard(encode({ kind: 'stroke', stroke }), { reliable: true, topic: WHITEBOARD_TOPIC })
    },
    [sendWhiteboard, updateStrokes],
  )

  const clearWhiteboard = useCallback(() => {
    updateStrokes(() => [])
    sendWhiteboard(encode({ kind: 'clear' }), { reliable: true, topic: WHITEBOARD_TOPIC })
  }, [sendWhiteboard, updateStrokes])

  const trackRefs = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: true },
  ])
  const screenShares = trackRefs.filter(
    (t) => t.publication?.source === Track.Source.ScreenShare && t.publication.isSubscribed,
  )
  const cameras = trackRefs.filter((t) =>
    t.publication
      ? t.publication.source === Track.Source.Camera
      : t.source === Track.Source.Camera,
  )

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      <header className="flex items-center justify-between gap-3 border-b bg-background/80 px-4 py-2.5 backdrop-blur">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="truncate text-lg font-bold">{meeting.title}</h1>
          <Badge className="inline-flex items-center gap-1.5 bg-destructive text-destructive-foreground">
            <span className="size-2 animate-pulse rounded-full bg-white" />
            Live
          </Badge>
          <span className="hidden items-center gap-1 text-sm text-muted-foreground sm:inline-flex">
            <Users className="size-4" />
            {participants.length} participant{participants.length === 1 ? '' : 's'}
          </span>
        </div>
        <span className="rounded-md bg-secondary px-2.5 py-1 font-mono text-xs tracking-wider">
          Code: {meeting.joinCode}
        </span>
      </header>

      <div className="relative flex flex-1 min-h-0">
        <div className="relative flex min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-hidden p-4 pb-28">
            {screenShares[0] && (
              <div className="mb-2 aspect-video w-full">
                <ParticipantVideoTile
                  trackRef={screenShares[0]}
                  raisedHand={raisedHands[screenShares[0].participant.identity]?.raised}
                />
              </div>
            )}
            <div
              className={cn(
                'grid gap-2',
                screenShares.length > 0
                  ? 'grid-cols-2 sm:grid-cols-3'
                  : cameras.length === 1
                    ? 'grid-cols-1'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
              )}
            >
              {cameras.map((t) => (
                <div key={t.participant.identity} className="aspect-video">
                  <ParticipantVideoTile trackRef={t} raisedHand={raisedHands[t.participant.identity]?.raised} />
                </div>
              ))}
            </div>
          </div>

          <ControlBar
            isHost={isHost}
            isEnding={isEnding}
            isLeaving={isLeaving}
            raisedHand={raisedHands[localParticipant.identity]?.raised ?? false}
            chatOpen={panel === 'chat'}
            participantsOpen={panel === 'participants'}
            whiteboardOpen={panel === 'whiteboard'}
            isRecording={isRecording}
            onToggleChat={() => setPanel((p) => (p === 'chat' ? null : 'chat'))}
            onToggleParticipants={() => setPanel((p) => (p === 'participants' ? null : 'participants'))}
            onToggleWhiteboard={() => setPanel((p) => (p === 'whiteboard' ? null : 'whiteboard'))}
            onToggleRaiseHand={toggleRaiseHand}
            onToggleRecording={toggleRecording}
            onLeave={() => {
              void onLeave()
            }}
          />
        </div>

        {panel !== null && (
          <div className="absolute inset-y-0 right-0 z-20 flex w-80 max-w-[85%] shrink-0 flex-col border-l bg-card shadow-2xl md:static md:shadow-none">
            <div className="flex border-b">
              <button
                type="button"
                onClick={() => setPanel('participants')}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 px-2 py-2 text-sm font-medium transition-colors',
                  panel === 'participants' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground',
                )}
              >
                <Users className="size-4" />
                <span className="hidden sm:inline">Participants</span>
                <span className="sm:hidden">{participants.length}</span>
              </button>
              <button
                type="button"
                onClick={() => setPanel('chat')}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 px-2 py-2 text-sm font-medium transition-colors',
                  panel === 'chat' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground',
                )}
              >
                <MessageSquare className="size-4" />
                Chat
              </button>
              <button
                type="button"
                onClick={() => setPanel('whiteboard')}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 px-2 py-2 text-sm font-medium transition-colors',
                  panel === 'whiteboard' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground',
                )}
              >
                <PenLine className="size-4" />
                <span className="hidden sm:inline">Whiteboard</span>
              </button>
            </div>
            <div className="min-h-0 flex-1">
              {panel === 'participants' && (
                <ParticipantsPanel
                  isHost={isHost}
                  localRole={localRole}
                  raisedHands={raisedHands}
                  onKick={onKick}
                  onMuteAll={muteAll}
                />
              )}
              {panel === 'chat' && <ChatPanel meetingId={meeting.id} />}
              {panel === 'whiteboard' && (
                <WhiteboardPanel strokes={strokes} onStroke={addStroke} onClear={clearWhiteboard} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
