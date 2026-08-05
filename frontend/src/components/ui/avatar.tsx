import { cn } from '../../lib/utils'

export const Avatar = ({
  name,
  imageUrl,
  className,
}: {
  name: string
  imageUrl?: string | null
  className?: string
}) =>
  imageUrl ? (
    <img
      src={imageUrl}
      alt={name}
      className={cn('size-9 shrink-0 rounded-full object-cover', className)}
    />
  ) : (
    <div
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary',
        className,
      )}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
