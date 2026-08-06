import { useEffect, useRef, useState } from 'react'
import { Eraser } from 'lucide-react'
import { cn } from '../../../lib/utils'

export interface WhiteboardStroke {
  id: string
  color: string
  size: number
  points: { x: number; y: number }[]
}

const COLORS = ['#111827', '#dc2626', '#2563eb', '#16a34a', '#f59e0b', '#9333ea']
const SIZES = [3, 6, 10]

interface WhiteboardPanelProps {
  strokes: WhiteboardStroke[]
  onStroke: (stroke: WhiteboardStroke) => void
  onClear: () => void
}

export const WhiteboardPanel = ({ strokes, onStroke, onClear }: WhiteboardPanelProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const currentRef = useRef<WhiteboardStroke | null>(null)
  const [color, setColor] = useState(COLORS[0])
  const [size, setSize] = useState(SIZES[1])
  const [drawing, setDrawing] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect()
      setCanvasSize({ width: Math.round(rect.width), height: Math.round(rect.height) })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !canvasSize.width) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { width, height } = canvasSize
    const dpr = window.devicePixelRatio || 1
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    const drawStroke = (s: WhiteboardStroke) => {
      if (s.points.length < 2) return
      ctx.strokeStyle = s.color
      ctx.lineWidth = s.size
      ctx.beginPath()
      s.points.forEach((p, i) => {
        const x = p.x * width
        const y = p.y * height
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()
    }

    strokes.forEach(drawStroke)
    if (currentRef.current) drawStroke(currentRef.current)
  }, [strokes, canvasSize])

  const getPoint = (e: React.PointerEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    }
  }

  const drawSegment = (from: { x: number; y: number }, to: { x: number; y: number }, stroke: WhiteboardStroke) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(from.x * rect.width, from.y * rect.height)
    ctx.lineTo(to.x * rect.width, to.y * rect.height)
    ctx.stroke()
  }

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    canvasRef.current?.setPointerCapture(e.pointerId)
    const point = getPoint(e)
    if (!point) return
    currentRef.current = { id: crypto.randomUUID(), color, size, points: [point] }
    setDrawing(true)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const current = currentRef.current
    if (!current) return
    const point = getPoint(e)
    if (!point) return
    const points = [...current.points, point]
    currentRef.current = { ...current, points }
    const [from, to] = [points[points.length - 2], points[points.length - 1]]
    drawSegment(from, to, current)
  }

  const onPointerUp = () => {
    setDrawing(false)
    const stroke = currentRef.current
    currentRef.current = null
    if (stroke && stroke.points.length >= 2) onStroke(stroke)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <div className="flex items-center gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`Color ${c}`}
              className={cn(
                'size-6 rounded-full border-2 transition-transform hover:scale-110',
                color === c ? 'border-foreground' : 'border-transparent',
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="flex items-center gap-1">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              aria-label={`Brush size ${s}`}
              className={cn('rounded-md border p-1.5', size === s && 'bg-secondary')}
            >
              <span className="block rounded-full bg-foreground" style={{ width: s, height: s }} />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear whiteboard"
          className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Eraser className="size-4" />
          Clear
        </button>
      </div>

      <div ref={containerRef} className="min-h-0 flex-1 bg-white">
        <canvas
          ref={canvasRef}
          className={cn('h-full w-full touch-none', drawing ? 'cursor-crosshair' : 'cursor-default')}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        />
      </div>
    </div>
  )
}
