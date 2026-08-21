import { useCallback, useEffect, useMemo, useState } from 'react'
import welcomeSource from '@/content/welcome.md?raw'
import { countWords } from '@/lib/markdown'

const STORAGE_KEY = 'markdown-workspace:document'

type StoredDocument = {
  source: string
  title: string
  fileName: string | null
  updatedAt: number
}

function loadStored(): StoredDocument | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredDocument
    if (typeof parsed.source !== 'string') return null
    return parsed
  } catch {
    return null
  }
}

function deriveTitle(source: string): string {
  const match = source.match(/^#\s+(.+)$/m)
  return match?.[1]?.trim() || 'Untitled'
}

export function useDocument() {
  const initial = useMemo(() => loadStored(), [])
  const [source, setSourceState] = useState(initial?.source ?? welcomeSource)
  const [title, setTitle] = useState(initial?.title ?? deriveTitle(welcomeSource))
  const [fileName, setFileName] = useState<string | null>(initial?.fileName ?? null)
  const [dirty, setDirty] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const handle = window.setTimeout(() => {
      const nextTitle = deriveTitle(source)
      setTitle(nextTitle)
      const payload: StoredDocument = {
        source,
        title: nextTitle,
        fileName,
        updatedAt: Date.now(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    }, 400)
    return () => window.clearTimeout(handle)
  }, [source, fileName, hydrated])

  const updateSource = useCallback((next: string) => {
    setSourceState(next)
    setDirty(true)
  }, [])

  const loadDocument = useCallback((next: string, nextFileName?: string | null) => {
    setSourceState(next)
    setTitle(deriveTitle(next))
    setFileName(nextFileName ?? null)
    setDirty(false)
  }, [])

  const markClean = useCallback(() => setDirty(false), [])

  const resetToWelcome = useCallback(() => {
    setSourceState(welcomeSource)
    setTitle(deriveTitle(welcomeSource))
    setFileName(null)
    setDirty(false)
  }, [])

  const stats = useMemo(
    () => ({
      words: countWords(source),
      chars: source.length,
      lines: source.length === 0 ? 0 : source.split('\n').length,
    }),
    [source],
  )

  return {
    source,
    title,
    fileName,
    dirty,
    stats,
    updateSource,
    loadDocument,
    setFileName,
    markClean,
    resetToWelcome,
    setSource: updateSource,
  }
}
