import { GithubLogo, BracketsCurly, Star } from '@phosphor-icons/react'
import { useGitHubStars } from '@/hooks/useGitHubStars'
import { GITHUB_REPO_URL, JSON_WORKSPACE_URL } from '@/lib/links'
import { cn } from '@/lib/cn'

function formatStars(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k`
  return String(count)
}

export function WorkspaceLinks() {
  const stars = useGitHubStars()

  return (
    <div className="flex shrink-0 items-center gap-2">
      <a
        href={JSON_WORKSPACE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-white/8 bg-ink-900/70 px-3 text-[12px] font-medium text-mist-200',
          'transition-all duration-[160ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
          'hover:border-accent-500/30 hover:bg-accent-500/10 hover:text-accent-400',
        )}
        title="Open JSON Workspace in a new tab"
      >
        <BracketsCurly size={16} weight="bold" aria-hidden />
        <span className="hidden sm:inline">JSON Workspace</span>
        <span className="sm:hidden">JSON</span>
      </a>

      <a
        href={GITHUB_REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'group inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-white/8 bg-ink-900/70 pl-3 pr-1.5 text-[12px] font-medium text-mist-200',
          'transition-all duration-[160ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
          'hover:border-white/14 hover:bg-white/5 hover:text-mist-100',
        )}
        title="View Markdown Workspace on GitHub"
      >
        <GithubLogo size={16} weight="fill" aria-hidden />
        <span className="hidden sm:inline">GitHub</span>
        <span
          className={cn(
            'inline-flex min-w-8 items-center justify-center gap-1 rounded-full bg-white/8 px-2 py-1 text-[11px] tabular-nums text-mist-200',
            'transition-colors duration-[160ms] group-hover:bg-white/12',
          )}
          aria-label={stars == null ? 'Star count loading' : `${stars} stars`}
        >
          <Star size={11} weight="fill" className="text-amber-300/90" aria-hidden />
          {stars == null ? '—' : formatStars(stars)}
        </span>
      </a>
    </div>
  )
}
