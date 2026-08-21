import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import {
  CaretDown,
  FileDoc,
  FileHtml,
  FileMd,
  FilePdf,
  FloppyDisk,
  FolderOpen,
} from '@phosphor-icons/react'
import { cn } from '@/lib/cn'

export type ExportFormat = 'md' | 'html' | 'docx' | 'pdf'

type FileMenuProps = {
  dirty: boolean
  fileName: string | null
  busy?: boolean
  onOpen: () => void
  onSave: () => void
  onExport: (format: ExportFormat) => void
}

export function FileMenu({
  dirty,
  fileName,
  busy = false,
  onOpen,
  onSave,
  onExport,
}: FileMenuProps) {
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
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        disabled={busy}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-white/8 bg-ink-900/80 px-2.5 text-[11px] font-medium text-mist-300 transition-all duration-[160ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
          'hover:border-white/12 hover:bg-white/4 hover:text-mist-100',
          'disabled:cursor-not-allowed disabled:opacity-40',
          open && 'border-accent-500/30 bg-accent-500/10 text-accent-400',
        )}
      >
        <FloppyDisk size={14} weight={dirty ? 'fill' : 'regular'} aria-hidden />
        <span className="hidden sm:inline">File</span>
        <CaretDown
          size={10}
          weight="bold"
          className={cn('transition-transform duration-[160ms]', open && 'rotate-180')}
          aria-hidden
        />
      </button>

      <div
        id={menuId}
        role="menu"
        aria-label="File actions"
        className={cn(
          'absolute right-0 top-[calc(100%+8px)] z-50 min-w-56 origin-top-right rounded-lg border border-white/10 bg-ink-800/95 p-1 shadow-xl shadow-black/50 backdrop-blur-md',
          'transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
          open
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none -translate-y-1 scale-[0.98] opacity-0',
        )}
      >
        {fileName ? (
          <p className="truncate px-2.5 py-1.5 text-[10px] text-mist-400">
            {fileName}
            {dirty ? ' · unsaved' : ''}
          </p>
        ) : null}

        <MenuItem
          icon={<FolderOpen size={14} weight="bold" />}
          label="Open"
          hint="Ctrl+O"
          onSelect={() => {
            setOpen(false)
            onOpen()
          }}
        />
        <MenuItem
          icon={<FloppyDisk size={14} weight="bold" />}
          label="Save"
          hint="Ctrl+S"
          onSelect={() => {
            setOpen(false)
            onSave()
          }}
        />

        <div className="my-1 h-px bg-white/8" />

        <p className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-mist-400">
          Export
        </p>
        <MenuItem
          icon={<FileMd size={14} weight="bold" />}
          label="Markdown (.md)"
          onSelect={() => {
            setOpen(false)
            onExport('md')
          }}
        />
        <MenuItem
          icon={<FileHtml size={14} weight="bold" />}
          label="HTML (.html)"
          onSelect={() => {
            setOpen(false)
            onExport('html')
          }}
        />
        <MenuItem
          icon={<FileDoc size={14} weight="bold" />}
          label="Word (.docx)"
          onSelect={() => {
            setOpen(false)
            onExport('docx')
          }}
        />
        <MenuItem
          icon={<FilePdf size={14} weight="bold" />}
          label="PDF (Print…)"
          onSelect={() => {
            setOpen(false)
            onExport('pdf')
          }}
        />
      </div>
    </div>
  )
}

function MenuItem({
  icon,
  label,
  hint,
  onSelect,
}: {
  icon: ReactNode
  label: string
  hint?: string
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[12px] text-mist-200 transition-colors duration-[140ms] hover:bg-white/6 hover:text-mist-100"
    >
      <span className="text-accent-400">{icon}</span>
      <span className="flex-1">{label}</span>
      {hint ? <span className="text-[10px] text-mist-400">{hint}</span> : null}
    </button>
  )
}
