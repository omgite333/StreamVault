import { Link } from 'react-router-dom'

export const Footer = () => (
  <footer className="border-t bg-muted/40">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:px-6 md:flex-row">
      <nav className="flex items-center gap-6 text-sm text-muted-foreground">
        <Link to="/courses" className="transition-colors hover:text-foreground">
          Courses
        </Link>
        <Link to="/about" className="transition-colors hover:text-foreground">
          About
        </Link>
        <Link to="/contact" className="transition-colors hover:text-foreground">
          Contact
        </Link>
      </nav>
      <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} All rights reserved.</p>
    </div>
  </footer>
)
