import { useParticipants } from '@livekit/components-react'
import { Hand, MicOff, UserMinus, VolumeX } from 'lucide-react'
import { Button } from '../../ui/button'
import { cn } from '../../../lib/utils'
import type { MeetingRole } from '../../../types'

export interface RaisedHand {
  name: string
  raised: boolean
}

interface ParticipantsPanelProps {
  isHost: boolean
  localRole: MeetingRole
  raisedHands: Record<string, RaisedHand>
  onKick: (identity: string) => void
  onMuteAll: () => void
}

export const ParticipantsPanel = ({
  isHost,
  localRole,
  raisedHands,
  onKick,
  onMuteAll,
}: ParticipantsPanelProps) => {
  const participants = useParticipants()

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold">
          Participants ({participants.length})
        </h3>
        {isHost && (
          <Button variant="ghost" size="sm" onClick={onMuteAll} aria-label="Mute all">
            <VolumeX />
            Mute all
          </Button>
        )}
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto p-3">
        {participants.map((participant) => {
          const raised = raisedHands[participant.identity]?.raised
          return (
            <div
              key={participant.identity}
              className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-secondary/60"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold',
                    raised && 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
                  )}
                >
                  {participant.name?.charAt(0)?.toUpperCase() ?? '?'}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {participant.name}
                    {participant.isLocal && <span className="text-muted-foreground"> (you)</span>}
                  </p>
                  {participant.isLocal && (
                    <span className="text-[10px] text-muted-foreground">{localRole.toLowerCase()}</span>
                  )}
                </div>
                {raised && <Hand className="size-4 shrink-0 text-yellow-500" />}
                {!participant.isMicrophoneEnabled && <MicOff className="size-3.5 shrink-0 text-muted-foreground" />}
              </div>
              {isHost && !participant.isLocal && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => onKick(participant.identity)}
                  aria-label={`Remove ${participant.name}`}
                >
                  <UserMinus />
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
