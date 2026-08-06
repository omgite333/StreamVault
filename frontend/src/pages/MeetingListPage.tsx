import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { History, KeyRound, Plus, Radio } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Skeleton } from '../components/ui/skeleton'
import { MeetingCard } from '../components/meeting/MeetingCard'
import { useMeetings } from '../hooks/useMeetings'
import { usePageTitle } from '../hooks/usePageTitle'
import { useToast } from '../components/ui/toast-context'
import { useAuthStore } from '../store/auth.store'
import { meetingService, storeJoinToken } from '../services/meeting.service'
import type { Meeting } from '../types'
import { cn, getErrorMessage } from '../lib/utils'

type Tab = 'live' | 'upcoming' | 'past'

const tabs: { key: Tab; label: string }[] = [
  { key: 'live', label: 'Live Now' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Previous' },
]

export const MeetingListPage = () => {
  usePageTitle('Live Meetings')
  const navigate = useNavigate()
  const { toast } = useToast()
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { meetings, isLoading, deleteMeeting } = useMeetings('all')
  const [tab, setTab] = useState<Tab>('live')
  const [joinCode, setJoinCode] = useState('')
  const [guestName, setGuestName] = useState('')
  const [joining, setJoining] = useState(false)

  const filtered = (meetings ?? []).filter((m) => {
    if (tab === 'live') return m.status === 'LIVE'
    if (tab === 'past') return m.status === 'ENDED'
    return m.status === 'SCHEDULED'
  })

  const handleDelete = (meeting: Meeting) => {
    if (!window.confirm(`Delete "${meeting.title}" and all of its data? This cannot be undone.`)) return
    deleteMeeting(meeting.id)
  }

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) {
      toast({ title: 'Enter a meeting code', variant: 'error' })
      return
    }
    setJoining(true)
    try {
      const { data } = await meetingService.joinByCode({
        joinCode: joinCode.trim(),
        name: guestName.trim() || 'Guest',
      })
      storeJoinToken(data.data.meeting.id, data.data)
      navigate(`/meeting/${data.data.meeting.id}`)
    } catch (error) {
      toast({ title: 'Could not join', description: getErrorMessage(error), variant: 'error' })
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Live Meetings</h1>
          <p className="mt-1 text-muted-foreground">Join live sessions or start your own room.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/meeting/history">
            <Button variant="outline">
              <History />
              My History
            </Button>
          </Link>
          <Link to="/meeting/create">
            <Button>
              <Plus />
              New Meeting
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center gap-2">
              <KeyRound className="size-5 text-primary" />
              <h2 className="font-semibold">Join with a code</h2>
            </div>
            <div className="space-y-2">
              <Label htmlFor="joinCode">Meeting code</Label>
              <Input
                id="joinCode"
                placeholder="e.g. A1B2C3"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
            </div>
            {!isAuthenticated && (
              <div className="space-y-2">
                <Label htmlFor="guestName">Your name</Label>
                <Input
                  id="guestName"
                  placeholder="e.g. Alex"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
              </div>
            )}
            <Button className="w-full" onClick={handleJoinByCode} disabled={joining}>
              <Radio />
              {joining ? 'Joining…' : 'Join Meeting'}
            </Button>
            {!isAuthenticated && (
              <p className="text-xs text-muted-foreground">
                Guests join without an account. {` `}
                <Link to="/auth/login" className="text-primary hover:underline">
                  Sign in
                </Link>{' '}
                to participate.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <div className="mb-4 flex gap-2">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                  tab === key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/70',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-52" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No meetings here right now.</p>
                {tab !== 'past' && (
                  <Link to="/meeting/create" className="mt-4 inline-block">
                    <Button>
                      <Plus />
                      Schedule a Meeting
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  canDelete={Boolean(user && (user.role === 'ADMIN' || meeting.hostId === user.id))}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
