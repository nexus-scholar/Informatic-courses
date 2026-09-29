import clsx from 'clsx'

export function Logomark(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 36 36" fill="none" {...props}>
      <rect width="36" height="36" rx="8" className="fill-sky-500/10 dark:fill-sky-400/20" />
      <path
        d="M9 13.5L14.5 18L9 22.5M16 23.5H27M27 9H9C7.89543 9 7 9.89543 7 11V25C7 26.1046 7.89543 27 9 27H27C28.1046 27 29 26.1046 29 25V11C29 9.89543 28.1046 9 27 9Z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-sky-600 dark:stroke-sky-400"
      />
    </svg>
  )
}

export function Logo({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={clsx('flex items-center gap-3', className)} {...props}>
      <Logomark className="h-9 w-9 flex-none" />
      <div className="flex flex-col text-right">
        <span className="font-display text-base font-bold text-slate-900 dark:text-white leading-tight">
          الإعلام الآلي 1AS
        </span>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          المنهاج التفاعلي المطور
        </span>
      </div>
    </div>
  )
}
