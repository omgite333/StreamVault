import type { TrackReference, TrackReferenceOrPlaceholder } from '@livekit/components-core'
import { VideoTrack, useIsSpeaking } from '@livekit/components-react'
import { Hand, MicOff } from 'lucide-react'
import { cn } from '../../../lib/utils'

interface ParticipantVideoTileProps {
  trackRef: TrackReferenceOrPlaceholder
  raisedHand?: boolean
}

export const ParticipantVideoTile = ({ trackRef, raisedHand }: ParticipantVideoTileProps) => {
  const { participant } = trackRef
  const isSpeaking = useIsSpeaking(participant)
  const isMuted = trackRef.publication?.isMuted ?? true
  const hasVideo = Boolean(trackRef.publication && trackRef.publication.isSubscribed && !trackRef.publication.isMuted)

  return (
    <div
      className={cn(
        'relative h-full w-full overflow-hidden rounded-lg border bg-secondary/40',
        isSpeaking ? 'ring-2 ring-primary' : 'border-border',
      )}
    >
      {hasVideo && trackRef.publication ? (
        <VideoTrack trackRef={trackRef as TrackReference} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary to-secondary/60">
          <span className="text-3xl font-bold text-muted-foreground">
            {participant.name?.charAt(0)?.toUpperCase() ?? '?'}
          </span>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-2">
        <span className="truncate text-xs font-medium text-white">
          {participant.name}
          {participant.isLocal && ' (you)'}
        </span>
        <div className="flex items-center gap-1.5">
          {raisedHand && <Hand className="size-4 text-yellow-400" />}
          {isMuted && <MicOff className="size-4 text-white/80" />}
        </div>
      </div>
    </div>
  )
}
