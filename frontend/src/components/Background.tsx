const blobClass =
  'animate-blob absolute rounded-full blur-3xl'

export const Background = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: 'radial-gradient(hsl(248 65% 55% / 0.06) 1px, transparent 1px)',
        backgroundSize: '26px 26px',
      }}
    />
    <div className={`${blobClass} -left-40 -top-40 size-[30rem] bg-primary/25 dark:bg-primary/15`} />
    <div
      className={`${blobClass} -right-32 top-16 size-[26rem] bg-sky-400/25 dark:bg-sky-400/15`}
      style={{ animationDelay: '-6s' }}
    />
    <div
      className={`${blobClass} bottom-0 left-1/4 size-80 bg-pink-400/25 dark:bg-pink-400/15`}
      style={{ animationDelay: '-12s' }}
    />
    <div
      className={`${blobClass} bottom-24 right-1/5 size-72 bg-emerald-300/25 dark:bg-emerald-300/15`}
      style={{ animationDelay: '-3s' }}
    />
    <div
      className={`${blobClass} left-1/2 top-1/3 size-64 bg-amber-300/25 dark:bg-amber-300/15`}
      style={{ animationDelay: '-9s' }}
    />
  </div>
)
