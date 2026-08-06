import { Spinner } from '../ui/spinner'

interface MeetingCreateLoaderProps {
  isStarting: boolean
}

export const MeetingCreateLoader = ({ isStarting }: MeetingCreateLoaderProps) => (
  <div className="flex w-full max-w-xs animate-loader-in flex-col items-center gap-3 rounded-2xl border bg-card p-8 shadow-xl">
    <div className="relative flex animate-float-slow items-center justify-center">
      <span className="absolute inset-0 size-8 animate-ping rounded-full bg-primary/20" />
      <Spinner className="size-7 text-primary" />
    </div>
    <p className="text-sm font-medium">{isStarting ? 'Starting your meeting…' : 'Creating your meeting…'}</p>
    <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
      <div className="animate-progress h-full w-1/3 rounded-full bg-primary" />
    </div>
  </div>
)
