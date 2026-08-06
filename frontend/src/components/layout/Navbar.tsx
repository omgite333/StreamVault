import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Menu, PlayCircle, User, X } from 'lucide-react'
import { Button } from '../ui/button'
import { ThemeToggle } from './ThemeToggle'
import { useAuthStore } from '../../store/auth.store'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/utils'

export const Navbar = () => {
  const { isAuthenticated, user } = useAuthStore()
  const { logout, isLoggingOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    setMobileOpen(false)
    await logout()
    navigate('/')
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'text-sm font-medium transition-colors hover:text-foreground',
      isActive ? 'text-foreground' : 'text-muted-foreground',
    )

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
      isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
    )

  const links = (
    <>
      <NavLink to="/courses" className={navLinkClass}>
        Courses
      </NavLink>
      <NavLink to="/meeting" className={navLinkClass}>
        Live
      </NavLink>
      {isAuthenticated && (
        <NavLink to="/community" className={navLinkClass}>
          Community
        </NavLink>
      )}
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
    </>
  )

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2">
          <PlayCircle className="size-6 text-primary" />
          <span className="text-lg font-bold tracking-tight">StreamVault</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">{links}</nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden items-center gap-2 md:flex">
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

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t bg-background px-4 py-3 md:hidden">
          <div className="space-y-1">
            <NavLink to="/courses" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
              Courses
            </NavLink>
            <NavLink to="/meeting" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
              Live
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/community" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
                Community
              </NavLink>
            )}
            {isAuthenticated && (
              <NavLink to="/dashboard" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
                Dashboard
              </NavLink>
            )}
            {isAuthenticated && user?.role === 'ADMIN' && (
              <NavLink to="/admin" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
                Admin
              </NavLink>
            )}
            {isAuthenticated && (
              <NavLink to="/profile" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
                Profile
              </NavLink>
            )}
          </div>
          <div className="mt-3 border-t pt-3">
            {isAuthenticated ? (
              <Button variant="outline" className="w-full" onClick={handleLogout} disabled={isLoggingOut}>
                <LogOut />
                Logout
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/auth/login">
                  <Button variant="outline" className="w-full" onClick={() => setMobileOpen(false)}>
                    Login
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button className="w-full" onClick={() => setMobileOpen(false)}>
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
