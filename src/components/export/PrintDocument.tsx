import { useEffect, useMemo, useState } from 'react'
import { renderMarkdown } from '@/lib/markdown'

type PrintDocumentProps = {
  source: string
  title: string
}

function stripLeadingTitleHeading(html: string, title: string): string {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return html.replace(
    new RegExp(`^\\s*<h1[^>]*>\\s*${escaped}\\s*<\\/h1>\\s*`, 'i'),
    '',
  )
}

export function PrintDocument({ source, title }: PrintDocumentProps) {
  const [html, setHtml] = useState('')

  useEffect(() => {
    let cancelled = false
    void renderMarkdown(source).then((result) => {
      if (!cancelled) setHtml(result)
    })
    return () => {
      cancelled = true
    }
  }, [source])

  const bodyHtml = useMemo(
    () => stripLeadingTitleHeading(html, title),
    [html, title],
  )

  const printedOn = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="print-root" aria-hidden data-doc-title={title}>
      <header className="print-title-page">
        <div className="print-title-rule" aria-hidden />
        <h1 className="print-title">{title}</h1>
        <p className="print-meta">{printedOn}</p>
        <div className="print-title-rule print-title-rule-bottom" aria-hidden />
      </header>

      <article
        className="print-body"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />
    </div>
  )
}
