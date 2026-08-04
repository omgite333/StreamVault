import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'

export const NotFoundPage = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
    <p className="text-7xl font-extrabold text-primary/30">404</p>
    <h1 className="text-2xl font-bold">Page not found</h1>
    <p className="max-w-md text-sm text-muted-foreground">
      The page you are looking for doesn't exist or has been moved.
    </p>
    <Link to="/">
      <Button>Back to Home</Button>
    </Link>
  </div>
)
