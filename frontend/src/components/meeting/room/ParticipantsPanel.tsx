import { useLocalParticipant, useParticipants } from '@livekit/components-react'
import { Hand, MicOff, Pin, PinOff, UserMinus, VolumeX } from 'lucide-react'
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
  pinnedIdentity: string | null
  onPin: (identity: string) => void
  onKick: (identity: string) => void
  onMuteAll: () => void
}

export const ParticipantsPanel = ({
  isHost,
  localRole,
  raisedHands,
  pinnedIdentity,
  onPin,
  onKick,
  onMuteAll,
}: ParticipantsPanelProps) => {
  const participants = useParticipants()
  const { localParticipant } = useLocalParticipant()
  const all = [localParticipant, ...participants]

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold">Participants ({all.length})</h3>
        {isHost && (
          <Button variant="ghost" size="sm" onClick={onMuteAll} aria-label="Mute all">
            <VolumeX />
            Mute all
          </Button>
        )}
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto p-3">
        {all.map((participant) => {
          const raised = raisedHands[participant.identity]?.raised
          const pinned = pinnedIdentity === participant.identity
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
                    {pinned && (
                      <span className="ml-1 inline-flex items-center gap-0.5 text-xs text-primary">
                        <Pin className="size-3" /> pinned
                      </span>
                    )}
                  </p>
                  {participant.isLocal && (
                    <span className="text-[10px] text-muted-foreground">{localRole.toLowerCase()}</span>
                  )}
                </div>
                {raised && <Hand className="size-4 shrink-0 text-yellow-500" />}
                {!participant.isMicrophoneEnabled && <MicOff className="size-3.5 shrink-0 text-muted-foreground" />}
              </div>
              {!participant.isLocal && (
                <div className="flex shrink-0 items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn('size-7', pinned && 'bg-secondary text-primary')}
                    onClick={() => onPin(participant.identity)}
                    aria-label={pinned ? `Unpin ${participant.name}` : `Pin ${participant.name}`}
                  >
                    {pinned ? <PinOff /> : <Pin />}
                  </Button>
                  {isHost && (
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
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
