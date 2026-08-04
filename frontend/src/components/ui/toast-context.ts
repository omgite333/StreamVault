import * as React from 'react'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastOptions {
  title: string
  description?: string
  variant?: ToastVariant
}

export interface ToastContextValue {
  toast: (options: ToastOptions) => void
}

export const ToastContext = React.createContext<ToastContextValue | null>(null)

export const useToast = () => {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
