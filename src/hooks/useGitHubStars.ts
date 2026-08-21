import { useEffect, useState } from 'react'
import { GITHUB_REPO_API } from '@/lib/links'

const CACHE_KEY = 'markdown-workspace:github-stars'
const CACHE_TTL_MS = 1000 * 60 * 30

type CachePayload = { stars: number; fetchedAt: number }

function readCache(): CachePayload | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachePayload
    if (typeof parsed.stars !== 'number' || typeof parsed.fetchedAt !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

function writeCache(stars: number) {
  try {
    const payload: CachePayload = { stars, fetchedAt: Date.now() }
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    /* ignore */
  }
}

export function useGitHubStars() {
  const [stars, setStars] = useState<number | null>(() => readCache()?.stars ?? null)

  useEffect(() => {
    let cancelled = false
    const cached = readCache()
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return
    }

    void fetch(GITHUB_REPO_API, {
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('GitHub API error')
        const data = (await response.json()) as { stargazers_count?: number }
        if (typeof data.stargazers_count !== 'number') return
        if (cancelled) return
        setStars(data.stargazers_count)
        writeCache(data.stargazers_count)
      })
      .catch(() => {
        /* keep cached value */
      })

    return () => {
      cancelled = true
    }
  }, [])

  return stars
}
