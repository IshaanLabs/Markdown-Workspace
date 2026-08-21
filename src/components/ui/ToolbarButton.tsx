import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type ToolbarButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  shortcut?: string
  active?: boolean
  children: ReactNode
}

export function ToolbarButton({
  label,
  shortcut,
  active = false,
  className,
  children,
  ...props
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={shortcut ? `${label} (${shortcut})` : label}
      className={cn(
        'group relative inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-mist-300 transition-all duration-[160ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
        'hover:bg-white/6 hover:text-mist-100',
        'active:scale-[0.94] active:bg-white/10',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/60',
        'disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-mist-300',
        active && 'bg-accent-500/15 text-accent-400 ring-1 ring-accent-500/25',
        className,
      )}
      {...props}
    >
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-1/2 top-[calc(100%+8px)] z-50 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-ink-800 px-2 py-1 text-[11px] font-medium text-mist-100 opacity-0 shadow-lg shadow-black/40',
          'transition-all duration-[160ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
          'group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100',
          'translate-y-1',
        )}
      >
        {label}
        {shortcut ? (
          <span className="ml-1.5 text-mist-400">{shortcut}</span>
        ) : null}
      </span>
    </button>
  )
}
