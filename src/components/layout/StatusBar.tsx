type StatusBarProps = {
  words: number
  chars: number
  lines: number
  hint?: string
}

export function StatusBar({ words, chars, lines, hint }: StatusBarProps) {
  return (
    <footer className="flex h-8 shrink-0 items-center justify-between gap-3 border-t border-white/6 bg-ink-850/90 px-4 text-[11px] text-mist-400">
      <div className="flex items-center gap-3">
        <span>
          <span className="text-mist-300">{words}</span> words
        </span>
        <span className="text-white/15">|</span>
        <span>
          <span className="text-mist-300">{chars}</span> chars
        </span>
        <span className="text-white/15">|</span>
        <span>
          <span className="text-mist-300">{lines}</span> lines
        </span>
      </div>
      <p className="truncate text-mist-400">{hint ?? 'Split view · live preview'}</p>
    </footer>
  )
}
