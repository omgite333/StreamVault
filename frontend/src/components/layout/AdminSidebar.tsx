import { NavLink, Link } from 'react-router-dom'
import { BarChart3, BookOpen, FolderPlus, LayoutDashboard, Users, ArrowLeft, X } from 'lucide-react'
import { cn } from '../../lib/utils'

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/courses', label: 'Courses', icon: BookOpen, end: true },
  { to: '/admin/courses/new', label: 'Create Course', icon: FolderPlus },
  { to: '/admin/upload', label: 'Upload Video', icon: BarChart3 },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

interface AdminSidebarProps {
  open: boolean
  onClose: () => void
}

export const AdminSidebar = ({ open, onClose }: AdminSidebarProps) => (
  <aside
    className={cn(
      'fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r bg-card transition-transform lg:static lg:translate-x-0',
      open ? 'translate-x-0' : '-translate-x-full',
    )}
  >
    <div className="flex h-16 items-center justify-between border-b px-6">
      <Link to="/dashboard" className="flex items-center gap-2 text-sm font-bold" onClick={onClose}>
        <ArrowLeft className="size-4" />
        StreamVault Admin
      </Link>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close menu"
        className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground lg:hidden"
      >
        <X className="size-5" />
      </button>
    </div>
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground',
            )
          }
        >
          <Icon className="size-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  </aside>
)
