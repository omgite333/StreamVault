import { Navigate, Outlet } from 'react-router-dom'
import { PlayCircle } from 'lucide-react'
import { useAuthStore } from '../store/auth.store'
import { ScrollToTop } from '../components/ScrollToTop'

export const AuthLayout = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4">
      <ScrollToTop />
      <div className="mb-6 flex items-center gap-2">
        <PlayCircle className="size-7 text-primary" />
        <span className="text-xl font-bold">StreamVault</span>
      </div>
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
        <Outlet />
      </div>
    </div>
  )
}
