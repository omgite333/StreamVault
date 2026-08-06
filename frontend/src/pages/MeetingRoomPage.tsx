import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Calendar, Check, Clock, Copy, PlayCircle, Radio, Trash2, Users, Video } from 'lucide-react'
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react'
import '@livekit/components-styles'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import { Spinner } from '../components/ui/spinner'
import { MeetingRoom } from '../components/meeting/room/MeetingRoom'
import { useMeeting } from '../hooks/useMeetings'
import { usePageTitle } from '../hooks/usePageTitle'
import { useAuthStore } from '../store/auth.store'
import { useToast } from '../components/ui/toast-context'
import { formatDate } from '../lib/utils'

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL as string | undefined

export const MeetingRoomPage = () => {
  usePageTitle('Live Meeting')
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const user = useAuthStore((s) => s.user)
  const {
    meeting,
    meetingLoading,
    joinData,
    joinLoading,
    refetchJoin,
    startMeeting,
    isStarting,
    endMeeting,
    isEnding,
    leaveMeeting,
    isLeaving,
    deleteMeeting,
    isDeleting,
    kickParticipant,
    startRecording,
    stopRecording,
  } = useMeeting(id)

  const [entered, setEntered] = useState(false)
  const [disconnected, setDisconnected] = useState(false)
  const [copied, setCopied] = useState(false)
  const joinedAt = useRef(Date.now())
  const leftRef = useRef(false)
  const enteredRef = useRef(false)

  const isHost = Boolean(user && meeting && meeting.hostId === user.id)
  const meetingLive = meeting?.status === 'LIVE'

  const handleLeave = useCallback(async () => {
    if (leftRef.current) return
    leftRef.current = true
    const duration = Math.round((Date.now() - joinedAt.current) / 1000)
    try {
      await leaveMeeting({ duration })
    } catch {
      /* attendance is best-effort */
    }
    navigate('/meeting')
  }, [leaveMeeting, navigate])

  const handleHostEnd = useCallback(async () => {
    if (leftRef.current) return
    leftRef.current = true
    const duration = Math.round((Date.now() - joinedAt.current) / 1000)
    const [endResult] = await Promise.allSettled([
      endMeeting(id),
      leaveMeeting({ duration }).catch(() => {}),
    ])
    if (endResult.status === 'rejected') {
      leftRef.current = false
      return
    }
    navigate('/meeting')
  }, [endMeeting, id, leaveMeeting, navigate])

  const handleDelete = useCallback(async () => {
    if (!window.confirm(`Delete "${meeting?.title}" and all of its data? This cannot be undone.`)) return
    await deleteMeeting(id)
    navigate('/meeting')
  }, [deleteMeeting, id, meeting?.title, navigate])

  useEffect(() => {
    if ((entered || meetingLive) && joinData) {
      enteredRef.current = true
    }
  }, [entered, meetingLive, joinData])

  useEffect(() => {
    return () => {
      if (enteredRef.current) {
        void handleLeave()
      }
    }
  }, [handleLeave])

  if (meetingLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
        <h1 className="mb-2 text-2xl font-bold">Meeting not found</h1>
        <p className="mb-6 text-muted-foreground">This meeting may have been deleted.</p>
        <Link to="/meeting">
          <Button>Back to Meetings</Button>
        </Link>
      </div>
    )
  }

  if (meeting.status === 'ENDED') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>{meeting.title}</CardTitle>
            <CardDescription>This meeting has ended.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-4" />
                {formatDate(meeting.scheduledAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-4" />
                {new Date(meeting.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="size-4" />
                {meeting._count?.participants ?? 0} participants joined
              </span>
            </div>

            {meeting.recordingUrl && (
              <a href={meeting.recordingUrl} target="_blank" rel="noreferrer" className="block">
                <Button className="w-full">
                  <PlayCircle />
                  Watch Replay
                </Button>
              </a>
            )}

            <Button variant="outline" className="w-full" onClick={() => navigate('/meeting')}>
              Back to Meetings
            </Button>
            {isHost && (
              <Button
                variant="outline"
                className="w-full text-destructive"
                disabled={isDeleting}
                onClick={() => void handleDelete()}
              >
                <Trash2 />
                Delete Meeting
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!LIVEKIT_URL) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="mb-2 text-2xl font-bold">LiveKit not configured</h1>
        <p className="mb-6 text-muted-foreground">
          Set <code className="rounded bg-secondary px-1.5 py-0.5">VITE_LIVEKIT_URL</code> and the backend LiveKit
          credentials to enable live meetings.
        </p>
        <Link to="/meeting">
          <Button>Back to Meetings</Button>
        </Link>
      </div>
    )
  }

  if (!entered && !meetingLive) {
    if (isHost) {
      return (
        <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-primary/5 via-transparent to-transparent px-4 py-12">
          <Card className="w-full max-w-xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary/15 via-accent/10 to-transparent px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 animate-float-slow items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                  <Video />
                </div>
                <div className="min-w-0">
                  <CardTitle className="truncate">{meeting.title}</CardTitle>
                  <CardDescription>
                    You're the host. Start the meeting so others can join.
                  </CardDescription>
                </div>
              </div>
            </div>
            <CardContent className="space-y-4 pt-6">
              <div className="rounded-xl border-2 border-dashed bg-secondary/40 p-4">
                <p className="text-xs font-medium text-muted-foreground">Share this code with participants</p>
                <div className="mt-1.5 flex items-center justify-between gap-3">
                  <p className="font-mono text-3xl font-bold tracking-widest">{meeting.joinCode}</p>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(meeting.joinCode).catch(() => {})
                      setCopied(true)
                      window.setTimeout(() => setCopied(false), 1500)
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-secondary"
                  >
                    {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <Button
                className="w-full"
                size="lg"
                disabled={isStarting}
                onClick={async () => {
                  try {
                    await startMeeting(id)
                    setEntered(true)
                  } catch {
                    /* stay on the gate; the toast already explains the failure */
                  }
                }}
              >
                {isStarting ? <Spinner /> : <Radio />}
                Start Meeting
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/meeting')}>
                Cancel
              </Button>
              <Button
                variant="outline"
                className="w-full text-destructive"
                disabled={isDeleting}
                onClick={() => void handleDelete()}
              >
                <Trash2 />
                Delete Meeting
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>{meeting.title}</CardTitle>
            <CardDescription>Hosted by {meeting.host.name}. The host hasn't started yet.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              size="lg"
              disabled={joinLoading}
              onClick={async () => {
                if (!joinData) await refetchJoin()
                setEntered(true)
              }}
            >
              {joinLoading ? <Spinner /> : <Radio />}
              Join Early
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/meeting')}>
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (disconnected || !joinData) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>{disconnected ? 'You left the meeting' : 'Joining…'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {disconnected && (
              <p className="text-sm text-muted-foreground">Thanks for joining. Your attendance was recorded.</p>
            )}
            <Button className="w-full" onClick={() => navigate('/meeting')}>
              Back to Meetings
            </Button>
            {disconnected && meeting.status === 'LIVE' && (
              <Button variant="outline" className="w-full" onClick={() => setDisconnected(false)}>
                Rejoin
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <LiveKitRoom
      token={joinData.token}
      serverUrl={LIVEKIT_URL}
      connect={true}
      onConnected={() => setDisconnected(false)}
      onDisconnected={() => setDisconnected(true)}
      onError={(error) => {
        toast({ title: 'Connection error', description: error.message, variant: 'error' })
      }}
    >
      <RoomAudioRenderer />
      <MeetingRoom
        meeting={meeting}
        isHost={isHost}
        localRole={joinData.role}
        isEnding={isEnding}
        isLeaving={isLeaving}
        onLeave={isHost ? handleHostEnd : handleLeave}
        onStartRecording={() => {
          startRecording().catch(() => {})
        }}
        onStopRecording={() => {
          stopRecording().catch(() => {})
        }}
        onKick={(identity) => {
          void kickParticipant(identity)
        }}
      />
    </LiveKitRoom>
  )
}
