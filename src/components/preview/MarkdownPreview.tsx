import { useEffect, useImperativeHandle, useRef, useState, forwardRef, type MouseEvent } from 'react'
import { renderMarkdown } from '@/lib/markdown'
import { toggleTaskAtIndex } from '@/lib/activeFormats'
import { cn } from '@/lib/cn'

export type MarkdownPreviewHandle = {
  scrollToHeading: (id: string) => void
}

type MarkdownPreviewProps = {
  source: string
  onChangeSource?: (next: string) => void
  className?: string
}

function scrollChildIntoContainer(container: HTMLElement, el: HTMLElement) {
  const containerRect = container.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()
  const nextTop = container.scrollTop + (elRect.top - containerRect.top) - 24
  container.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' })
}

export const MarkdownPreview = forwardRef<MarkdownPreviewHandle, MarkdownPreviewProps>(
  function MarkdownPreview({ source, onChangeSource, className }, ref) {
    const [html, setHtml] = useState('')
    const [pending, setPending] = useState(true)
    const rootRef = useRef<HTMLDivElement>(null)
    const scrollRootRef = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref, () => ({
      scrollToHeading: (id: string) => {
        const root = rootRef.current
        const scroller = scrollRootRef.current
        if (!root || !scroller) return

        const tryScroll = () => {
          const el =
            root.querySelector(`#${CSS.escape(id)}`) ??
            root.querySelector(`[id="${CSS.escape(id)}"]`)
          if (!(el instanceof HTMLElement)) return false
          scrollChildIntoContainer(scroller, el)
          el.classList.add('outline-flash')
          window.setTimeout(() => el.classList.remove('outline-flash'), 900)
          return true
        }

        if (tryScroll()) return
        // Retry once after layout (e.g. mode switch / late render)
        window.requestAnimationFrame(() => {
          window.setTimeout(() => {
            tryScroll()
          }, 50)
        })
      },
    }))

    useEffect(() => {
      let cancelled = false
      setPending(true)
      const handle = window.setTimeout(() => {
        void renderMarkdown(source).then((result) => {
          if (cancelled) return
          setHtml(result)
          setPending(false)
        })
      }, 60)

      return () => {
        cancelled = true
        window.clearTimeout(handle)
      }
    }, [source])

    const handleClick = (event: MouseEvent<HTMLDivElement>) => {
      if (!onChangeSource) return
      const target = event.target
      if (!(target instanceof Element)) return

      const checkbox = target.closest('input[type="checkbox"]')
      if (!(checkbox instanceof HTMLInputElement)) return
      if (!rootRef.current?.contains(checkbox)) return

      event.preventDefault()
      event.stopPropagation()

      const boxes = rootRef.current.querySelectorAll('input[type="checkbox"]')
      const index = Array.from(boxes).indexOf(checkbox)
      if (index < 0) return

      const next = toggleTaskAtIndex(source, index)
      if (next != null) onChangeSource(next)
    }

    return (
      <div
        ref={scrollRootRef}
        className={cn('relative h-full min-h-0 overflow-auto', className)}
      >
        <div
          ref={rootRef}
          className={cn(
            'preview-prose mx-auto max-w-3xl px-6 py-6 transition-opacity duration-[160ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
            pending && html ? 'opacity-70' : 'opacity-100',
          )}
          dangerouslySetInnerHTML={{ __html: html }}
          onClick={handleClick}
        />
        {pending && !html ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-pulse rounded-full bg-accent-glow" />
          </div>
        ) : null}
      </div>
    )
  },
)
