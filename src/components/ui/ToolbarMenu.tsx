import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { CaretDown } from '@phosphor-icons/react'
import { ToolbarButton } from '@/components/ui/ToolbarButton'
import { cn } from '@/lib/cn'

type ToolbarMenuProps = {
  label: string
  icon: ReactNode
  children: ReactNode
  disabled?: boolean
  /** True when the current selection uses this menu's format (e.g. a heading). */
  formatActive?: boolean
}

export function ToolbarMenu({
  label,
  icon,
  children,
  disabled,
  formatActive = false,
}: ToolbarMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <ToolbarButton
        label={label}
        disabled={disabled}
        active={open || formatActive}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className="w-auto gap-0.5 px-1.5"
        onClick={() => setOpen((value) => !value)}
      >
        {icon}
        <CaretDown
          size={10}
          weight="bold"
          className={cn(
            'text-mist-400 transition-transform duration-[160ms]',
            (open || formatActive) && 'text-accent-400',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </ToolbarButton>

      <div
        id={menuId}
        role="menu"
        aria-label={label}
        className={cn(
          'absolute left-0 top-[calc(100%+8px)] z-50 min-w-40 origin-top-left rounded-lg border border-white/10 bg-ink-800/95 p-1 shadow-xl shadow-black/50 backdrop-blur-md',
          'transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
          open
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none -translate-y-1 scale-[0.98] opacity-0',
        )}
      >
        <div
          onClick={() => setOpen(false)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') setOpen(false)
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

type ToolbarMenuItemProps = {
  label: string
  hint?: string
  active?: boolean
  onSelect: () => void
}

export function ToolbarMenuItem({ label, hint, active = false, onSelect }: ToolbarMenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      aria-current={active ? 'true' : undefined}
      onClick={onSelect}
      className={cn(
        'flex w-full cursor-pointer items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-left text-[12px] transition-colors duration-[140ms]',
        active
          ? 'bg-accent-500/15 text-accent-400'
          : 'text-mist-200 hover:bg-white/6 hover:text-mist-100',
      )}
    >
      <span>{label}</span>
      {hint ? (
        <span className={cn('font-mono text-[10px]', active ? 'text-accent-400/80' : 'text-mist-400')}>
          {hint}
        </span>
      ) : null}
    </button>
  )
}
