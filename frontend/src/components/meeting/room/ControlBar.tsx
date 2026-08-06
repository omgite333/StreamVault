import { CircleDot, CircleStop, Hand, LogOut, MessageSquare, Mic, MicOff, PenLine, ScreenShare, Square, Users, Video, VideoOff } from 'lucide-react'
import { useLocalParticipant } from '@livekit/components-react'
import { Button } from '../../ui/button'
import { Spinner } from '../../ui/spinner'
import { cn } from '../../../lib/utils'

interface ControlBarProps {
  isHost: boolean
  isEnding?: boolean
  isLeaving?: boolean
  raisedHand: boolean
  chatOpen: boolean
  participantsOpen: boolean
  whiteboardOpen: boolean
  isRecording: boolean
  onToggleChat: () => void
  onToggleParticipants: () => void
  onToggleWhiteboard: () => void
  onToggleRaiseHand: () => void
  onToggleRecording: () => void
  onLeave: () => void
}

export const ControlBar = ({
  isHost,
  isEnding = false,
  isLeaving = false,
  raisedHand,
  chatOpen,
  participantsOpen,
  whiteboardOpen,
  isRecording,
  onToggleChat,
  onToggleParticipants,
  onToggleWhiteboard,
  onToggleRaiseHand,
  onToggleRecording,
  onLeave,
}: ControlBarProps) => {
  const { isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled, localParticipant } = useLocalParticipant()
  const leaving = isEnding || isLeaving

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center p-3">
      <div className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-2.5 rounded-2xl border bg-card/90 px-4 py-2.5 shadow-xl backdrop-blur">
        <Button
          variant={isMicrophoneEnabled ? 'secondary' : 'destructive'}
          size="icon"
          className="h-12 w-12 [&_svg]:size-6"
          onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
          aria-label={isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isMicrophoneEnabled ? <Mic /> : <MicOff />}
        </Button>
        <Button
          variant={isCameraEnabled ? 'secondary' : 'destructive'}
          size="icon"
          className="h-12 w-12 [&_svg]:size-6"
          onClick={() => localParticipant.setCameraEnabled(!isCameraEnabled)}
          aria-label={isCameraEnabled ? 'Turn camera off' : 'Turn camera on'}
        >
          {isCameraEnabled ? <Video /> : <VideoOff />}
        </Button>
        <Button
          variant={isScreenShareEnabled ? 'destructive' : 'secondary'}
          size="icon"
          className="h-12 w-12 [&_svg]:size-6"
          onClick={() => localParticipant.setScreenShareEnabled(!isScreenShareEnabled)}
          aria-label={isScreenShareEnabled ? 'Stop sharing screen' : 'Share screen'}
        >
          <ScreenShare />
        </Button>
        <div className="mx-0.5 h-7 w-px bg-border" />
        <Button
          variant={raisedHand ? 'secondary' : 'ghost'}
          size="icon"
          className={cn('h-12 w-12 [&_svg]:size-6', raisedHand && 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400')}
          onClick={onToggleRaiseHand}
          aria-label={raisedHand ? 'Lower hand' : 'Raise hand'}
        >
          <Hand />
        </Button>
        <Button
          variant={participantsOpen ? 'secondary' : 'ghost'}
          size="icon"
          className="h-12 w-12 [&_svg]:size-6"
          onClick={onToggleParticipants}
          aria-label="Toggle participants"
        >
          <Users />
        </Button>
        <Button
          variant={chatOpen ? 'secondary' : 'ghost'}
          size="icon"
          className="h-12 w-12 [&_svg]:size-6"
          onClick={onToggleChat}
          aria-label="Toggle chat"
        >
          <MessageSquare />
        </Button>
        <Button
          variant={whiteboardOpen ? 'secondary' : 'ghost'}
          size="icon"
          className="h-12 w-12 [&_svg]:size-6"
          onClick={onToggleWhiteboard}
          aria-label="Toggle whiteboard"
        >
          <PenLine />
        </Button>
        {isHost && (
          <Button
            variant={isRecording ? 'destructive' : 'secondary'}
            size="icon"
            className="h-12 w-12 [&_svg]:size-6"
            onClick={onToggleRecording}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? (
              <Square className="animate-pulse" />
            ) : (
              <CircleDot className="text-destructive" />
            )}
          </Button>
        )}
        <div className="mx-0.5 h-7 w-px bg-border" />
        <Button
          variant="destructive"
          size="lg"
          className="h-12 min-w-28 px-6 text-base [&_svg]:size-5"
          onClick={onLeave}
          disabled={leaving}
        >
          {leaving ? <Spinner /> : isHost ? <CircleStop /> : <LogOut />}
          {leaving ? (isHost ? 'Ending…' : 'Leaving…') : isHost ? 'End' : 'Leave'}
        </Button>
      </div>
    </div>
  )
}
