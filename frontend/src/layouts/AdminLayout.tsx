import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '../components/layout/AdminSidebar'

export const AdminLayout = () => (
  <div className="flex min-h-screen bg-muted/20">
    <AdminSidebar />
    <main className="flex-1 overflow-auto p-6">
      <div className="mx-auto max-w-6xl">
        <Outlet />
      </div>
    </main>
  </div>
)
