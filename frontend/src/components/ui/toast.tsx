import * as React from 'react'
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { ToastContext, type ToastOptions, type ToastVariant } from './toast-context'

interface ToastData {
  id: number
  title: string
  description?: string
  variant: ToastVariant
}

let nextId = 0

const variantStyles: Record<ToastVariant, { icon: typeof Info; container: string }> = {
  success: { icon: CircleCheck, container: 'text-success' },
  error: { icon: CircleAlert, container: 'text-destructive' },
  info: { icon: Info, container: 'text-primary' },
}

const ToastCard = ({ toast, onClose }: { toast: ToastData; onClose: () => void }) => {
  const { icon: Icon, container } = variantStyles[toast.variant]
  return (
    <div
      role="status"
      className="pointer-events-auto flex w-full items-start gap-3.5 rounded-xl border bg-card p-5 shadow-xl"
    >
      <Icon className={cn('mt-0.5 size-6 shrink-0', container)} />
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold">{toast.title}</p>
        {toast.description && <p className="mt-1 text-sm text-muted-foreground">{toast.description}</p>}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="size-5" />
      </button>
    </div>
  )
}

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = React.useState<ToastData[]>([])

  const dismiss = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = React.useCallback(
    (options: ToastOptions) => {
      const id = ++nextId
      setToasts((prev) => [...prev.slice(-3), { id, variant: 'info', ...options }])
      window.setTimeout(() => dismiss(id), 5000)
    },
    [dismiss],
  )

  const value = React.useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-center gap-2.5 sm:inset-x-auto sm:right-4 sm:w-[28rem] sm:items-end"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
