import { Code, Columns, Eye } from '@phosphor-icons/react'
import { cn } from '@/lib/cn'

export type ViewMode = 'edit' | 'split' | 'preview'

type ViewModeSwitcherProps = {
  value: ViewMode
  onChange: (mode: ViewMode) => void
}

const MODES: {
  id: ViewMode
  label: string
  icon: typeof Code
}[] = [
  { id: 'edit', label: 'Edit', icon: Code },
  { id: 'split', label: 'Split', icon: Columns },
  { id: 'preview', label: 'Preview', icon: Eye },
]

export function ViewModeSwitcher({ value, onChange }: ViewModeSwitcherProps) {
  return (
    <div
      role="radiogroup"
      aria-label="View mode"
      className="inline-flex items-center rounded-lg border border-white/8 bg-ink-900/80 p-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
    >
      {MODES.map(({ id, label, icon: Icon }) => {
        const active = value === id
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${label} mode`}
            title={`${label} mode`}
            onClick={() => onChange(id)}
            className={cn(
              'group relative flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium tracking-wide transition-all duration-[160ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
              active
                ? 'bg-ink-700 text-mist-100 shadow-[0_0_0_1px_rgba(45,212,191,0.25),0_4px_14px_rgba(0,0,0,0.35)]'
                : 'text-mist-400 hover:bg-white/4 hover:text-mist-200',
            )}
          >
            <Icon
              size={14}
              weight={active ? 'bold' : 'regular'}
              className={cn(
                'transition-colors duration-[160ms]',
                active ? 'text-accent-400' : 'text-mist-400 group-hover:text-mist-200',
              )}
              aria-hidden
            />
            <span className="hidden sm:inline">{label}</span>
            {active ? (
              <span
                className="pointer-events-none absolute inset-x-2 -bottom-px h-px bg-gradient-to-r from-transparent via-accent-500/70 to-transparent"
                aria-hidden
              />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
