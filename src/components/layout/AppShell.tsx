import type { ReactNode } from 'react'
import { Code, Eye } from '@phosphor-icons/react'
import { TitleBar } from '@/components/layout/TitleBar'
import { StatusBar } from '@/components/layout/StatusBar'
import { WorkspaceToolbar } from '@/components/layout/WorkspaceToolbar'
import type { ViewMode } from '@/components/layout/ViewModeSwitcher'
import type { ExportFormat } from '@/components/export/FileMenu'
import type { EditorView } from '@codemirror/view'
import type { ActiveFormats } from '@/lib/activeFormats'
import { cn } from '@/lib/cn'

type AppShellProps = {
  title: string
  dirty: boolean
  fileName: string | null
  words: number
  chars: number
  lines: number
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  outlineOpen: boolean
  onToggleOutline: () => void
  outlineCount: number
  exportBusy?: boolean
  onOpen: () => void
  onSave: () => void
  onExport: (format: ExportFormat) => void
  editorView: EditorView | null
  activeFormats: ActiveFormats
  editor: ReactNode
  preview: ReactNode
  outline?: ReactNode
  printDocument?: ReactNode
}

const MODE_HINT: Record<ViewMode, string> = {
  edit: 'Edit mode · focus on source',
  split: 'Split view · live preview',
  preview: 'Preview mode · reading layout',
}

export function AppShell({
  title,
  dirty,
  fileName,
  words,
  chars,
  lines,
  viewMode,
  onViewModeChange,
  outlineOpen,
  onToggleOutline,
  outlineCount,
  exportBusy,
  onOpen,
  onSave,
  onExport,
  editorView,
  activeFormats,
  editor,
  preview,
  outline,
  printDocument,
}: AppShellProps) {
  const showEditor = viewMode === 'edit' || viewMode === 'split'
  const showPreview = viewMode === 'preview' || viewMode === 'split'

  return (
    <div className="surface-noise flex h-full min-h-0 flex-col overflow-hidden text-mist-100">
      <TitleBar title={title} dirty={dirty} fileName={fileName} />

      <WorkspaceToolbar
        view={editorView}
        active={activeFormats}
        showFormatTools={showEditor}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        outlineOpen={outlineOpen}
        onToggleOutline={onToggleOutline}
        outlineCount={outlineCount}
        dirty={dirty}
        fileName={fileName}
        exportBusy={exportBusy}
        onOpen={onOpen}
        onSave={onSave}
        onExport={onExport}
      />

      <div className="relative flex min-h-0 flex-1">
        <aside
          className={cn(
            'shrink-0 overflow-hidden border-r border-white/6 bg-ink-850/95 backdrop-blur-md transition-[width,opacity,border-color] duration-[320ms] ease-[cubic-bezier(0.65,0,0.35,1)]',
            outlineOpen ? 'w-64 opacity-100' : 'w-0 border-transparent opacity-0',
          )}
          aria-hidden={!outlineOpen}
        >
          <div
            className={cn(
              'h-full w-64 transition-transform duration-[320ms] ease-[cubic-bezier(0.65,0,0.35,1)]',
              outlineOpen ? 'translate-x-0' : '-translate-x-3',
            )}
          >
            {outline}
          </div>
        </aside>

        <section
          className={cn(
            'grid min-h-0 min-w-0 flex-1 transition-[grid-template-columns] duration-[320ms] ease-[cubic-bezier(0.65,0,0.35,1)]',
            viewMode === 'split' && 'grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]',
            viewMode === 'edit' && 'grid-cols-[minmax(0,1fr)_0fr]',
            viewMode === 'preview' && 'grid-cols-[0fr_minmax(0,1fr)]',
          )}
        >
          <div
            className={cn(
              'flex min-h-0 min-w-0 flex-col overflow-hidden bg-ink-900/40 transition-opacity duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
              viewMode === 'split' && 'border-b border-white/6 md:border-b-0 md:border-r',
              showEditor ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
            aria-hidden={!showEditor}
          >
            <div className="flex h-9 shrink-0 items-center gap-2 border-b border-white/5 px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-mist-400">
              <Code size={14} weight="bold" className="text-accent-400" aria-hidden />
              Editor
            </div>
            <div className="min-h-0 flex-1">{editor}</div>
          </div>

          <div
            className={cn(
              'flex min-h-0 min-w-0 flex-col overflow-hidden bg-ink-850/30 transition-opacity duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
              showPreview ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
            aria-hidden={!showPreview}
          >
            <div className="flex h-9 shrink-0 items-center gap-2 border-b border-white/5 px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-mist-400">
              <Eye size={14} weight="bold" className="text-accent-400" aria-hidden />
              Preview
              {viewMode === 'preview' ? (
                <span className="ml-auto normal-case tracking-normal text-mist-400/80">
                  Reading view
                </span>
              ) : null}
            </div>
            <div
              className={cn(
                'min-h-0 flex-1',
                viewMode === 'preview' &&
                  '[&_.preview-prose]:max-w-3xl [&_.preview-prose]:px-8 [&_.preview-prose]:py-10',
              )}
            >
              {preview}
            </div>
          </div>
        </section>
      </div>

      <StatusBar
        words={words}
        chars={chars}
        lines={lines}
        hint={outlineOpen ? `${MODE_HINT[viewMode]} · outline open` : MODE_HINT[viewMode]}
      />

      {printDocument}
    </div>
  )
}
