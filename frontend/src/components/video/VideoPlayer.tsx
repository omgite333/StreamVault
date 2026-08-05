import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, MouseEvent, PointerEvent, TouchEvent } from 'react'
import {
  Check,
  ChevronDown,
  FastForward,
  Loader2,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  RotateCcw,
  Rewind,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { usePlayerStore } from '../../store/player.store'
import { useProgress } from '../../hooks/useProgress'
import { cn, formatDuration } from '../../lib/utils'

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]
const SKIP_SECONDS = 10
const AUTOPLAY_COUNTDOWN = 5

export interface NextVideo {
  id: string
  title: string
}

interface VideoPlayerProps {
  src: string | null | undefined
  videoId: string
  initialTime?: number
  poster?: string | null
  nextVideo?: NextVideo | null
  onNext?: () => void
  onEnded?: () => void
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const iconBtn =
  'flex size-9 max-sm:size-8 shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50'

const iconSize = 'size-5 max-sm:size-4'

const formatSpeed = (value: number) => `${value}x`

interface SwitchProps {
  checked: boolean
  onChange: () => void
}

const Switch = ({ checked, onChange }: SwitchProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={(e) => {
      e.stopPropagation()
      onChange()
    }}
    className={cn(
      'relative h-5 w-9 shrink-0 rounded-full transition-colors',
      checked ? 'bg-primary' : 'bg-white/30',
    )}
  >
    <span
      className={cn(
        'absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow transition-transform',
        checked && 'translate-x-4',
      )}
    />
  </button>
)

export const VideoPlayer = ({ src, videoId, initialTime = 0, poster, nextVideo, onNext, onEnded }: VideoPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const seekBarRef = useRef<HTMLDivElement>(null)
  const lastSavedRef = useRef(0)
  const lastMoveRef = useRef(Date.now())
  const draggingRef = useRef(false)
  const { updateProgress } = useProgress()
  const idRef = useRef(videoId)
  idRef.current = videoId

  const volume = usePlayerStore((s) => s.volume)
  const muted = usePlayerStore((s) => s.muted)
  const speed = usePlayerStore((s) => s.speed)
  const autoplayNext = usePlayerStore((s) => s.autoplayNext)
  const setVolume = usePlayerStore((s) => s.setVolume)
  const setMuted = usePlayerStore((s) => s.setMuted)
  const setSpeed = usePlayerStore((s) => s.setSpeed)
  const setAutoplayNext = usePlayerStore((s) => s.setAutoplayNext)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isEnded, setIsEnded] = useState(false)
  const [buffering, setBuffering] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false)
  const [seekPreview, setSeekPreview] = useState<number | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPiP, setIsPiP] = useState(false)
  const [pipSupported, setPipSupported] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [skipFeedback, setSkipFeedback] = useState<{ dir: 'forward' | 'back'; key: number } | null>(null)
  const [speedMenuMaxHeight, setSpeedMenuMaxHeight] = useState<number | undefined>(undefined)

  const speedBtnRef = useRef<HTMLButtonElement>(null)
  const lastTapRef = useRef<{ time: number; x: number } | null>(null)
  const singleTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const controlsVisibleRef = useRef(controlsVisible)
  controlsVisibleRef.current = controlsVisible

  const updateProgressRef = useRef(updateProgress)
  updateProgressRef.current = updateProgress
  const onNextRef = useRef(onNext)
  onNextRef.current = onNext
  const onEndedRef = useRef(onEnded)
  onEndedRef.current = onEnded

  const save = useCallback((seconds: number, completed = false) => {
    updateProgressRef.current({ videoId: idRef.current, lastTimestamp: Math.floor(seconds), completed })
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onPause = () => save(video.currentTime)

    video.addEventListener('pause', onPause)
    return () => {
      video.removeEventListener('pause', onPause)
      if (video.currentTime > 0) save(video.currentTime)
    }
  }, [src, save])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.volume = volume
    video.muted = muted
    video.playbackRate = speed
  }, [volume, muted, speed, src])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !initialTime || initialTime <= 0) return
    if (video.readyState >= 1) {
      video.currentTime = initialTime
      return
    }
    const onLoaded = () => {
      video.currentTime = initialTime
    }
    video.addEventListener('loadedmetadata', onLoaded, { once: true })
    return () => video.removeEventListener('loadedmetadata', onLoaded)
  }, [src, initialTime])

  useEffect(() => {
    setIsEnded(false)
    setCurrentTime(0)
    setBuffered(0)
    setSeekPreview(null)
    setSpeedMenuOpen(false)
    setSkipFeedback(null)
    setSpeedMenuMaxHeight(undefined)
    lastSavedRef.current = 0
    lastTapRef.current = null
    if (singleTapTimerRef.current) clearTimeout(singleTapTimerRef.current)
    if (skipFeedbackTimerRef.current) clearTimeout(skipFeedbackTimerRef.current)
    singleTapTimerRef.current = null
    skipFeedbackTimerRef.current = null
    const video = videoRef.current
    if (video) video.currentTime = 0
    if (document.pictureInPictureElement) void document.exitPictureInPicture()
  }, [src])

  useEffect(() => {
    const video = videoRef.current
    setPipSupported(Boolean(video?.requestPictureInPicture && document.pictureInPictureEnabled))
  }, [src])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onEnter = () => setIsPiP(true)
    const onLeave = () => setIsPiP(false)
    video.addEventListener('enterpictureinpicture', onEnter)
    video.addEventListener('leavepictureinpicture', onLeave)
    return () => {
      video.removeEventListener('enterpictureinpicture', onEnter)
      video.removeEventListener('leavepictureinpicture', onLeave)
    }
  }, [src])

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  useEffect(() => {
    if (!isPlaying || isEnded) setControlsVisible(true)
  }, [isPlaying, isEnded])

  useEffect(() => {
    if (!isPlaying || isEnded) return
    const id = setInterval(() => {
      if (Date.now() - lastMoveRef.current > 3000 && !speedMenuOpen) setControlsVisible(false)
    }, 500)
    return () => clearInterval(id)
  }, [isPlaying, isEnded, speedMenuOpen])

  useEffect(() => {
    if (!isEnded || !autoplayNext || !nextVideo) {
      setCountdown(null)
      return
    }
    setCountdown(AUTOPLAY_COUNTDOWN)
    const id = setInterval(() => {
      setCountdown((current) => {
        if (current === null) return current
        if (current <= 1) {
          onNextRef.current?.()
          return null
        }
        return current - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [isEnded, autoplayNext, nextVideo])

  const seekTo = (time: number) => {
    const video = videoRef.current
    if (!video || !Number.isFinite(video.duration)) return
    const next = clamp(time, 0, video.duration)
    video.currentTime = next
    setCurrentTime(next)
  }

  const skip = (seconds: number) => {
    const video = videoRef.current
    if (!video) return
    seekTo(video.currentTime + seconds)
  }

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      if (isEnded) {
        video.currentTime = 0
        setIsEnded(false)
      }
      void video.play()
    } else {
      video.pause()
    }
    setControlsVisible(true)
  }

  const toggleSpeedMenu = () => {
    if (!speedMenuOpen) {
      const btn = speedBtnRef.current
      const container = containerRef.current
      if (btn && container) {
        const spaceAbove = btn.getBoundingClientRect().top - container.getBoundingClientRect().top
        setSpeedMenuMaxHeight(Math.max(120, Math.floor(spaceAbove - 8)))
      }
    }
    setSpeedMenuOpen((open) => !open)
  }

  const replay = () => {
    const video = videoRef.current
    if (!video) return
    setIsEnded(false)
    setCountdown(null)
    video.currentTime = 0
    void video.play()
    setControlsVisible(true)
  }

  const toggleMute = () => {
    setMuted(!muted)
    setControlsVisible(true)
  }

  const changeVolume = (value: number) => {
    const next = clamp(value, 0, 1)
    setVolume(next)
    setMuted(false)
    const video = videoRef.current
    if (video) {
      video.volume = next
      video.muted = false
    }
  }

  const toggleFullscreen = () => {
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement) void document.exitFullscreen()
    else void el.requestFullscreen?.()
  }

  const togglePiP = async () => {
    const video = videoRef.current
    if (!video) return
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture()
      else if (video.requestPictureInPicture) await video.requestPictureInPicture()
    } catch {
      // Picture-in-Picture is unavailable
    }
  }

  const getSeekTime = (clientX: number) => {
    const bar = seekBarRef.current
    const video = videoRef.current
    if (!bar || !video || !Number.isFinite(video.duration)) return 0
    const rect = bar.getBoundingClientRect()
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1)
    return ratio * video.duration
  }

  const onSeekPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.stopPropagation()
    draggingRef.current = true
    seekBarRef.current?.setPointerCapture(e.pointerId)
    seekTo(getSeekTime(e.clientX))
  }

  const onSeekPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const time = getSeekTime(e.clientX)
    setSeekPreview(time)
    if (draggingRef.current) seekTo(time)
  }

  const onSeekPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    draggingRef.current = false
    seekBarRef.current?.releasePointerCapture(e.pointerId)
    setSeekPreview(null)
  }

  const onSeekPointerLeave = () => {
    if (!draggingRef.current) setSeekPreview(null)
  }

  const handleEnded = () => {
    const video = videoRef.current
    save(video?.duration ?? video?.currentTime ?? 0, true)
    setIsEnded(true)
    setControlsVisible(true)
    setSpeedMenuOpen(false)
    onEndedRef.current?.()
  }

  const isControlTarget = (target: EventTarget | null) =>
    target instanceof Element &&
    Boolean(target.closest('button, input, [role="switch"], [data-player-menu], [data-player-seekbar]'))

  const handleContainerClick = (e: MouseEvent<HTMLDivElement>) => {
    setSpeedMenuOpen(false)
    if (isControlTarget(e.target)) return
    togglePlay()
    containerRef.current?.focus()
  }

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (isControlTarget(e.target)) return
    e.preventDefault()
    lastMoveRef.current = Date.now()
  }

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (isControlTarget(e.target)) return
    const rect = containerRef.current?.getBoundingClientRect()
    const touch = e.changedTouches[0]
    if (!touch || !rect) return
    const x = touch.clientX - rect.left
    const now = Date.now()
    const prev = lastTapRef.current

    if (prev && now - prev.time <= 300 && Math.abs(x - prev.x) <= 60) {
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current)
        singleTapTimerRef.current = null
      }
      lastTapRef.current = null
      const forward = x >= rect.width / 2
      skip(forward ? SKIP_SECONDS : -SKIP_SECONDS)
      setSkipFeedback({ dir: forward ? 'forward' : 'back', key: now })
      if (skipFeedbackTimerRef.current) clearTimeout(skipFeedbackTimerRef.current)
      skipFeedbackTimerRef.current = setTimeout(() => setSkipFeedback(null), 800)
      lastMoveRef.current = now
      setControlsVisible(true)
      return
    }

    lastTapRef.current = { time: now, x }
    if (singleTapTimerRef.current) clearTimeout(singleTapTimerRef.current)
    singleTapTimerRef.current = setTimeout(() => {
      singleTapTimerRef.current = null
      lastTapRef.current = null
      if (controlsVisibleRef.current) {
        setControlsVisible(false)
      } else {
        lastMoveRef.current = Date.now()
        setControlsVisible(true)
      }
      containerRef.current?.focus()
    }, 260)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video) return
    const tag = (e.target as HTMLElement)?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

    const key = e.key.toLowerCase()
    const handledKeys = [' ', 'arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'm', 'k', 'f', 'p', 'home', 'end', 'j', 'l']
    if (!handledKeys.includes(key) && !(key >= '0' && key <= '9')) return

    e.preventDefault()
    switch (key) {
      case ' ':
      case 'k':
        togglePlay()
        break
      case 'arrowleft':
      case 'j':
        skip(-SKIP_SECONDS)
        break
      case 'arrowright':
      case 'l':
        skip(SKIP_SECONDS)
        break
      case 'arrowup':
        changeVolume(volume + 0.1)
        break
      case 'arrowdown':
        changeVolume(volume - 0.1)
        break
      case 'm':
        toggleMute()
        break
      case 'f':
        toggleFullscreen()
        break
      case 'p':
        if (pipSupported) void togglePiP()
        break
      case 'home':
        seekTo(0)
        break
      case 'end':
        seekTo(video.duration)
        break
      default: {
        if (key >= '0' && key <= '9') {
          seekTo((Number(key) / 9) * (video.duration || 0))
        }
      }
    }
  }

  const playedPct = duration > 0 ? (currentTime / duration) * 100 : 0
  const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="group relative aspect-video w-full overflow-hidden rounded-lg bg-black outline-none touch-manipulation"
      onMouseMove={() => {
        lastMoveRef.current = Date.now()
        setControlsVisible(true)
      }}
      onMouseLeave={() => {
        lastMoveRef.current = 0
        if (isPlaying && !isEnded) setControlsVisible(false)
      }}
      onClick={handleContainerClick}
      onDoubleClick={(e) => {
        e.preventDefault()
        toggleFullscreen()
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      onFocus={() => setControlsVisible(true)}
    >
      <video
        ref={videoRef}
        src={src ?? undefined}
        poster={poster ?? undefined}
        playsInline
        preload="metadata"
        className="h-full w-full object-contain"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={() => {
          const video = videoRef.current
          if (!video) return
          setCurrentTime(video.currentTime)
          if (video.currentTime - lastSavedRef.current >= 10) {
            lastSavedRef.current = video.currentTime
            save(video.currentTime)
          }
        }}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
        onDurationChange={() => setDuration(videoRef.current?.duration ?? 0)}
        onProgress={() => {
          const video = videoRef.current
          if (!video || video.buffered.length === 0) return
          setBuffered(video.buffered.end(video.buffered.length - 1))
        }}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onCanPlay={() => setBuffering(false)}
        onEnded={handleEnded}
        onVolumeChange={() => {
          const video = videoRef.current
          if (!video) return
          setVolume(video.volume)
          setMuted(video.muted)
        }}
      />

      {buffering && isPlaying && !isEnded && (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
          <Loader2 className="size-12 animate-spin text-white drop-shadow" />
        </div>
      )}

      {skipFeedback && (
        <div
          key={skipFeedback.key}
          className="pointer-events-none absolute inset-0 z-20 grid place-items-center"
        >
          <div className="flex size-20 max-sm:size-16 animate-[skip-pop_0.8s_ease-out] items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
            {skipFeedback.dir === 'forward' ? (
              <FastForward className="size-9 max-sm:size-7 fill-current" />
            ) : (
              <Rewind className="size-9 max-sm:size-7 fill-current" />
            )}
          </div>
        </div>
      )}

      {!isPlaying && !isEnded && (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              togglePlay()
            }}
            className="pointer-events-auto flex size-20 max-sm:size-16 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition-transform hover:scale-105 hover:bg-white/30"
            aria-label="Play"
          >
            <Play className="size-9 max-sm:size-7 fill-current" />
          </button>
        </div>
      )}

      {isEnded && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 bg-black/60 px-4 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-white/50">Finished</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={replay}
              className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <RotateCcw className="size-4" />
              Replay
            </button>
            {nextVideo && (
              <button
                type="button"
                onClick={() => onNextRef.current?.()}
                className="inline-flex max-w-full items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white/90"
              >
                <Play className="size-4 shrink-0 fill-current" />
                <span className="max-w-[60vw] truncate sm:max-w-[50vw]">Up next: {nextVideo.title}</span>
                {countdown !== null && <span className="shrink-0 tabular-nums text-zinc-500">{countdown}s</span>}
              </button>
            )}
          </div>
          {nextVideo && (
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-white/80">
              <Switch checked={autoplayNext} onChange={() => setAutoplayNext(!autoplayNext)} />
              Autoplay next video
            </label>
          )}
        </div>
      )}

      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-2 pt-10 transition-opacity duration-200',
          controlsVisible ? 'opacity-100' : 'opacity-0',
        )}
      >
        <div
          ref={seekBarRef}
          data-player-seekbar
          className="group/seek relative flex h-5 cursor-pointer items-center"
          onPointerDown={onSeekPointerDown}
          onPointerMove={onSeekPointerMove}
          onPointerUp={onSeekPointerUp}
          onPointerCancel={onSeekPointerUp}
          onPointerLeave={onSeekPointerLeave}
        >
          <div className="relative h-1.5 w-full rounded-full bg-white/25 transition-[height] group-hover/seek:h-2.5">
            {bufferedPct > 0 && (
              <div className="absolute left-0 top-0 h-full rounded-full bg-white/40" style={{ width: `${bufferedPct}%` }} />
            )}
            <div className="absolute left-0 top-0 h-full rounded-full bg-primary" style={{ width: `${playedPct}%` }} />
            <div
              className={cn(
                'absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-md opacity-0 transition-opacity group-hover/seek:opacity-100',
                draggingRef.current && 'opacity-100',
              )}
              style={{ left: `${playedPct}%` }}
            />
          </div>
          {seekPreview !== null && (
            <div
              className="pointer-events-none absolute bottom-6 -translate-x-1/2 rounded bg-black/80 px-2 py-0.5 text-xs font-medium text-white"
              style={{ left: `${(seekPreview / (duration || 1)) * 100}%` }}
            >
              {formatDuration(seekPreview)}
            </div>
          )}
        </div>

        <div className="pointer-events-auto flex items-center gap-1 max-sm:gap-0.5">
          <button type="button" onClick={togglePlay} className={cn(iconBtn, 'bg-white/15 hover:bg-white/30')} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <Pause className={cn('fill-current', iconSize)} /> : <Play className={cn('fill-current', iconSize)} />}
          </button>
          <button type="button" onClick={() => skip(-SKIP_SECONDS)} className={iconBtn} aria-label="Rewind 10 seconds">
            <Rewind className={iconSize} />
          </button>
          <button type="button" onClick={() => skip(SKIP_SECONDS)} className={iconBtn} aria-label="Forward 10 seconds">
            <FastForward className={iconSize} />
          </button>

          <div className="group/vol flex items-center" data-player-menu>
            <button type="button" onClick={toggleMute} className={iconBtn} aria-label={muted ? 'Unmute' : 'Mute'}>
              {muted || volume === 0 ? <VolumeX className={iconSize} /> : volume < 0.5 ? <Volume1 className={iconSize} /> : <Volume2 className={iconSize} />}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={muted ? 0 : Math.round(volume * 100)}
              onChange={(e) => changeVolume(Number(e.target.value) / 100)}
              aria-label="Volume"
              className="hidden h-1 w-0 cursor-pointer accent-primary opacity-0 transition-all duration-200 group-hover/vol:w-20 group-hover/vol:opacity-100 focus:w-20 focus:opacity-100 md:block"
            />
          </div>

          <span className="ml-2 shrink-0 text-xs tabular-nums text-white/80">
            {formatDuration(currentTime)}
            <span className="hidden sm:inline"> / {formatDuration(duration)}</span>
          </span>

          <div className="ml-auto flex items-center gap-1">
            <div className="relative" data-player-menu>
              <button
                ref={speedBtnRef}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleSpeedMenu()
                }}
                className="flex h-8 max-sm:h-7 items-center gap-1 rounded-md px-2 max-sm:px-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20"
                aria-label="Playback speed"
              >
                {formatSpeed(speed)}
                <ChevronDown className={cn('size-3.5 max-sm:size-3 transition-transform', speedMenuOpen && 'rotate-180')} />
              </button>
              {speedMenuOpen && (
                <div
                  className="absolute bottom-10 right-0 z-30 w-44 max-sm:w-40 overflow-y-auto rounded-lg border border-white/10 bg-zinc-900/95 shadow-xl backdrop-blur"
                  style={{ maxHeight: speedMenuMaxHeight }}
                >
                  <div className="sticky top-0 z-10 bg-zinc-900/95 px-3 pb-1 pt-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/50 backdrop-blur">
                    Playback speed
                  </div>
                  {SPEEDS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setSpeed(option)
                        setSpeedMenuOpen(false)
                      }}
                      className={cn(
                        'flex w-full items-center justify-between px-3 py-2 text-left text-sm text-white/70 transition-colors hover:bg-white/10',
                        option === speed && 'text-white',
                      )}
                    >
                      {formatSpeed(option)}
                      {option === speed && <Check className="size-4" />}
                    </button>
                  ))}
                  <div className="border-t border-white/10 px-3 py-2.5">
                    <label className="flex cursor-pointer items-center justify-between gap-3">
                      <span className="text-sm text-white/80">Autoplay next</span>
                      <Switch checked={autoplayNext} onChange={() => setAutoplayNext(!autoplayNext)} />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {pipSupported && (
              <button
                type="button"
                onClick={() => void togglePiP()}
                className={cn(iconBtn, 'max-sm:hidden')}
                aria-label="Picture in picture"
                aria-pressed={isPiP}
              >
                <PictureInPicture2 className={iconSize} />
              </button>
            )}

            <button type="button" onClick={toggleFullscreen} className={iconBtn} aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
              {isFullscreen ? <Minimize className={iconSize} /> : <Maximize className={iconSize} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
