import { useEffect, useRef } from 'react'
import { useProgress } from '../../hooks/useProgress'
import { cn } from '../../lib/utils'

interface VideoPlayerProps {
  src: string | null | undefined
  videoId: string
  initialTime?: number
  allowDownload?: boolean
  poster?: string | null
  onEnded?: () => void
}

export const VideoPlayer = ({ src, videoId, initialTime = 0, allowDownload = false, poster, onEnded }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const lastSavedRef = useRef(0)
  const { updateProgress } = useProgress()
  const idRef = useRef(videoId)
  idRef.current = videoId

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (initialTime > 0) {
      video.currentTime = initialTime
    }

    const save = (seconds: number, completed = false) => {
      updateProgress({ videoId: idRef.current, lastTimestamp: Math.floor(seconds), completed })
    }

    const onTimeUpdate = () => {
      const now = video.currentTime
      if (now - lastSavedRef.current >= 10) {
        lastSavedRef.current = now
        save(now)
      }
    }
    const onPause = () => save(video.currentTime)
    const onEnded = () => {
      save(video.duration ?? video.currentTime, true)
      onEnded?.()
    }

    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('pause', onPause)
    video.addEventListener('ended', onEnded)

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('ended', onEnded)
      if (video.currentTime > 0) {
        save(video.currentTime)
      }
    }
  }, [onEnded, updateProgress])

  return (
    <video
      ref={videoRef}
      src={src ?? undefined}
      poster={poster ?? undefined}
      controls
      preload="metadata"
      className={cn('aspect-video w-full rounded-lg bg-black')}
      {...(!allowDownload ? { controlsList: 'nodownload' } : {})}
    />
  )
}
