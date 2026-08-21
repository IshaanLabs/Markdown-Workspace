import { FileMd } from '@phosphor-icons/react'
import { WorkspaceLinks } from '@/components/layout/WorkspaceLinks'

type TitleBarProps = {
  title: string
  dirty: boolean
  fileName: string | null
}

export function TitleBar({ title, dirty, fileName }: TitleBarProps) {
  return (
    <header className="relative z-20 flex min-h-[4.25rem] shrink-0 items-center justify-between gap-4 border-b border-white/6 bg-ink-850/85 px-5 py-3 backdrop-blur-md">
      <div className="flex min-w-0 items-center gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-500/15 ring-1 ring-accent-500/30">
          <FileMd size={22} weight="duotone" className="text-accent-400" aria-hidden />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="truncate text-[1.15rem] font-semibold tracking-tight text-mist-100 sm:text-[1.25rem]">
              Markdown Workspace
            </h1>
            <span className="hidden rounded-full bg-accent-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-accent-400 sm:inline">
              v1
            </span>
          </div>
          <p className="truncate text-[12px] text-mist-400">
            {fileName ?? title}
            {dirty ? <span className="text-accent-400"> · unsaved</span> : null}
          </p>
        </div>
      </div>

      <WorkspaceLinks />
    </header>
  )
}
