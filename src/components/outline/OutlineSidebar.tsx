import { ListDashes } from '@phosphor-icons/react'
import type { OutlineHeading } from '@/lib/markdown'
import { cn } from '@/lib/cn'

type OutlineSidebarProps = {
  headings: OutlineHeading[]
  activeId: string | null
  onSelect: (heading: OutlineHeading) => void
}

export function OutlineSidebar({ headings, activeId, onSelect }: OutlineSidebarProps) {
  return (
    <div className="flex h-full w-64 flex-col bg-ink-850/95">
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-white/5 px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-mist-400">
        <ListDashes size={14} weight="bold" className="text-accent-400" aria-hidden />
        Outline
        <span className="ml-auto rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] tabular-nums text-mist-400 normal-case tracking-normal">
          {headings.length}
        </span>
      </div>

      <nav
        className="min-h-0 flex-1 overflow-y-auto px-2 py-2 [scrollbar-width:thin]"
        aria-label="Document outline"
      >
        {headings.length === 0 ? (
          <p className="px-2 py-3 text-[12px] leading-relaxed text-mist-400">
            Add headings with <span className="font-mono text-mist-300">#</span> to build an
            outline.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {headings.map((heading) => {
              const active = heading.id === activeId
              return (
                <li key={`${heading.id}-${heading.from}`}>
                  <button
                    type="button"
                    onClick={() => onSelect(heading)}
                    title={heading.text}
                    className={cn(
                      'group flex w-full cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-left text-[12px] transition-all duration-[160ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
                      active
                        ? 'bg-accent-500/15 text-accent-400'
                        : 'text-mist-300 hover:bg-white/5 hover:text-mist-100',
                    )}
                    style={{ paddingLeft: `${0.5 + (heading.level - 1) * 0.65}rem` }}
                  >
                    <span
                      className={cn(
                        'mt-1.5 h-1 w-1 shrink-0 rounded-full transition-colors duration-[160ms]',
                        active ? 'bg-accent-400' : 'bg-mist-400/50 group-hover:bg-mist-300',
                      )}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 truncate leading-snug">{heading.text}</span>
                    <span
                      className={cn(
                        'shrink-0 font-mono text-[10px] tabular-nums transition-opacity duration-[160ms]',
                        active ? 'text-accent-400/70 opacity-100' : 'text-mist-400 opacity-0 group-hover:opacity-100',
                      )}
                    >
                      H{heading.level}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </nav>
    </div>
  )
}
