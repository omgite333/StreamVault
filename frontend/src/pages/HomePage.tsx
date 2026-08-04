import { Link } from 'react-router-dom'
import { BookOpen, Download, PlayCircle, ShieldCheck, TrendingUp } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'

const features = [
  {
    icon: PlayCircle,
    title: 'Stream Anywhere',
    description: 'Watch high-quality video courses on any device, at your own pace.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Access',
    description: 'Every stream is verified and protected with signed, expiring URLs.',
  },
  {
    icon: TrendingUp,
    title: 'Track Progress',
    description: 'Your watch history and progress are saved automatically.',
  },
  {
    icon: Download,
    title: 'Download Resources',
    description: 'Grab course notes and PDFs whenever downloads are enabled.',
  },
]

export const HomePage = () => (
  <div>
    <section className="border-b bg-gradient-to-b from-accent/60 to-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6">
        <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <BookOpen className="size-3" />
          Learn anything, anywhere
        </span>
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
          Master new skills with <span className="text-primary">expert-led video courses</span>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          StreamVault brings premium video education to your screen with seamless streaming, progress
          tracking, and downloadable resources.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/courses">
            <Button size="lg">
              <PlayCircle />
              Browse Courses
            </Button>
          </Link>
          <Link to="/auth/register">
            <Button size="lg" variant="outline">
              Start Learning Free
            </Button>
          </Link>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <h2 className="mb-8 text-center text-2xl font-bold">Why StreamVault?</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, description }) => (
          <Card key={title}>
            <CardContent className="space-y-3 pt-6">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="size-5 text-primary" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  </div>
)
