import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Spinner } from '../components/ui/spinner'
import { Textarea } from '../components/ui/textarea'
import { useMeetings } from '../hooks/useMeetings'
import { usePageTitle } from '../hooks/usePageTitle'
import { MeetingCreateLoader } from '../components/meeting/MeetingCreateLoader'
import { createMeetingSchema, type CreateMeetingInput } from '../validations/meeting'
import { useAuthStore } from '../store/auth.store'
import { Link } from 'react-router-dom'

const toLocalDateTimeInput = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export const CreateMeetingPage = () => {
  usePageTitle('New Meeting')
  const { createMeeting, isCreating, startMeeting, isStarting } = useMeetings()
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [startNow, setStartNow] = useState(false)

  const busy = isCreating || isStarting

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateMeetingInput>({
    resolver: zodResolver(createMeetingSchema),
    defaultValues: {
      title: '',
      description: '',
      scheduledAt: toLocalDateTimeInput(new Date(Date.now() + 60 * 60 * 1000)),
      maxParticipants: 50,
    },
  })

  const onSubmit = async (values: CreateMeetingInput) => {
    const { data } = await createMeeting({
      title: values.title,
      description: values.description || undefined,
      scheduledAt: startNow ? undefined : values.scheduledAt ? new Date(values.scheduledAt).toISOString() : undefined,
      maxParticipants: values.maxParticipants,
    })
    if (startNow) {
      try {
        await startMeeting(data.data.id)
      } catch {
        /* LiveKit may be unavailable; the host can retry from the room page */
      }
    }
    navigate(`/meeting/${data.data.id}`)
  }

  return (
    <div className="mx-auto max-w-2xl py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Schedule a Meeting</h1>
        <p className="mt-1 text-muted-foreground">
          Start an instant room or schedule one for later. You'll be the host.
        </p>
      </div>

      {!isAuthenticated && (
        <Card className="mb-6">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">
              You need an account to host meetings.{' '}
              <Link to="/auth/register" className="text-primary hover:underline">
                Create one here
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Card className={busy ? 'pointer-events-none opacity-60 transition-opacity' : ''}>
          <CardHeader>
            <CardTitle>Meeting details</CardTitle>
            <CardDescription>A meeting code will be generated for your room.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="e.g. Weekly Q&A" {...register('title')} />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={4} placeholder="What is this meeting about?" {...register('description')} />
                {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
              </div>

              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <Label htmlFor="startNow">Start now</Label>
                  <p className="text-xs text-muted-foreground">Go live immediately instead of scheduling for later.</p>
                </div>
                <input
                  id="startNow"
                  type="checkbox"
                  checked={startNow}
                  onChange={(e) => setStartNow(e.target.checked)}
                  className="size-5 accent-primary"
                />
              </div>

              {!startNow && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="scheduledAt">Starts at</Label>
                    <Input id="scheduledAt" type="datetime-local" {...register('scheduledAt')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants">Max participants</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      min={2}
                      max={1000}
                      {...register('maxParticipants', {
                        setValueAs: (value) => (value === '' || value === undefined ? undefined : Number(value)),
                      })}
                    />
                    {errors.maxParticipants && (
                      <p className="text-xs text-destructive">{errors.maxParticipants.message}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={busy || !isAuthenticated} className="min-w-44">
                  {busy ? (
                    <>
                      <Spinner className="size-5" />
                      {isStarting ? 'Starting room…' : 'Creating meeting…'}
                    </>
                  ) : (
                    'Create Meeting'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/meeting')} disabled={busy}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {busy && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/40 backdrop-blur-[2px]">
            <MeetingCreateLoader isStarting={isStarting} />
          </div>
        )}
      </div>
    </div>
  )
}
