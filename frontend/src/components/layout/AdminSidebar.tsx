import { NavLink, Link } from 'react-router-dom'
import { BarChart3, BookOpen, FolderPlus, LayoutDashboard, Users, ArrowLeft } from 'lucide-react'
import { cn } from '../../lib/utils'

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/courses', label: 'Courses', icon: BookOpen, end: true },
  { to: '/admin/courses/new', label: 'Create Course', icon: FolderPlus },
  { to: '/admin/upload', label: 'Upload Video', icon: BarChart3 },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

export const AdminSidebar = () => (
  <aside className="flex w-64 shrink-0 flex-col border-r bg-card">
    <div className="flex h-16 items-center border-b px-6">
      <Link to="/dashboard" className="flex items-center gap-2 text-sm font-bold">
        <ArrowLeft className="size-4" />
        StreamVault Admin
      </Link>
    </div>
    <nav className="flex flex-1 flex-col gap-1 p-4">
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
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
