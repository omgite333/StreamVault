import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LogOut, PlayCircle, User } from 'lucide-react'
import { Button } from '../ui/button'
import { ThemeToggle } from './ThemeToggle'
import { useAuthStore } from '../../store/auth.store'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/utils'

export const Navbar = () => {
  const { isAuthenticated, user } = useAuthStore()
  const { logout, isLoggingOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'text-sm font-medium transition-colors hover:text-foreground',
      isActive ? 'text-foreground' : 'text-muted-foreground',
    )

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2">
          <PlayCircle className="size-6 text-primary" />
          <span className="text-lg font-bold tracking-tight">StreamVault</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/courses" className={navLinkClass}>
            Courses
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
          )}
          {isAuthenticated && user?.role === 'ADMIN' && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <Link to="/profile" aria-label="Profile">
                <Button variant="ghost" size="icon" className="overflow-hidden rounded-full">
                  {user?.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt={user.name} className="size-5 rounded-full object-cover" />
                  ) : (
                    <User className="size-5" />
                  )}
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoggingOut}>
                <LogOut />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/auth/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
