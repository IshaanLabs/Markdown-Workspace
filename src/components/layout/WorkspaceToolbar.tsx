import { ListDashes } from '@phosphor-icons/react'
import type { EditorView } from '@codemirror/view'
import { EditorToolbar } from '@/components/toolbar/EditorToolbar'
import { FileMenu, type ExportFormat } from '@/components/export/FileMenu'
import { ViewModeSwitcher, type ViewMode } from '@/components/layout/ViewModeSwitcher'
import type { ActiveFormats } from '@/lib/activeFormats'
import { cn } from '@/lib/cn'

type WorkspaceToolbarProps = {
  view: EditorView | null
  active: ActiveFormats
  showFormatTools: boolean
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  outlineOpen: boolean
  onToggleOutline: () => void
  outlineCount: number
  dirty: boolean
  fileName: string | null
  exportBusy?: boolean
  onOpen: () => void
  onSave: () => void
  onExport: (format: ExportFormat) => void
}

export function WorkspaceToolbar({
  view,
  active,
  showFormatTools,
  viewMode,
  onViewModeChange,
  outlineOpen,
  onToggleOutline,
  outlineCount,
  dirty,
  fileName,
  exportBusy,
  onOpen,
  onSave,
  onExport,
}: WorkspaceToolbarProps) {
  return (
    <div className="flex min-h-11 shrink-0 items-center gap-2 border-b border-white/6 bg-ink-850/60 px-2 py-1.5 backdrop-blur-sm">
      <div className="min-w-0 flex-1 overflow-hidden">
        {showFormatTools ? (
          <EditorToolbar view={view} active={active} className="px-0 py-0" />
        ) : (
          <p className="px-2 text-[11px] text-mist-400">Preview mode · formatting tools hidden</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5 border-l border-white/8 pl-2">
        <FileMenu
          dirty={dirty}
          fileName={fileName}
          busy={exportBusy}
          onOpen={onOpen}
          onSave={onSave}
          onExport={onExport}
        />
        <button
          type="button"
          onClick={onToggleOutline}
          aria-pressed={outlineOpen}
          aria-label={outlineOpen ? 'Hide outline' : 'Show outline'}
          title={outlineOpen ? 'Hide outline' : 'Show outline'}
          className={cn(
            'inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-medium transition-all duration-[160ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
            outlineOpen
              ? 'border-accent-500/30 bg-accent-500/15 text-accent-400 shadow-[0_0_0_1px_rgba(45,212,191,0.12)]'
              : 'border-white/8 bg-ink-900/80 text-mist-300 hover:border-white/12 hover:bg-white/4 hover:text-mist-100',
          )}
        >
          <ListDashes size={14} weight={outlineOpen ? 'bold' : 'regular'} aria-hidden />
          <span className="hidden sm:inline">Outline</span>
          <span
            className={cn(
              'rounded-full px-1.5 py-0.5 text-[10px] tabular-nums',
              outlineOpen ? 'bg-accent-500/20 text-accent-400' : 'bg-white/5 text-mist-400',
            )}
          >
            {outlineCount}
          </span>
        </button>
        <ViewModeSwitcher value={viewMode} onChange={onViewModeChange} />
      </div>
    </div>
  )
}
