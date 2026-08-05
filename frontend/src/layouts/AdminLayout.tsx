import { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { AdminSidebar } from '../components/layout/AdminSidebar'
import { Button } from '../components/ui/button'
import { PageLoader } from '../components/ui/page-loader'
import { ScrollToTop } from '../components/ScrollToTop'
import { usePageTitle } from '../hooks/usePageTitle'

export const AdminLayout = () => {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  usePageTitle('Admin')

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen bg-muted/20">
      <ScrollToTop />
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      <AdminSidebar open={open} onClose={() => setOpen(false)} />
      <main className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="mx-auto max-w-6xl">
          <Button
            variant="outline"
            size="sm"
            className="mb-4 lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu />
            Menu
          </Button>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
