export type ActiveFormats = {
  bold: boolean
  italic: boolean
  strike: boolean
  inlineCode: boolean
  link: boolean
  bulletList: boolean
  orderedList: boolean
  checklist: boolean
  quote: boolean
  heading: 0 | 1 | 2 | 3 | 4 | 5 | 6
}

const EMPTY: ActiveFormats = {
  bold: false,
  italic: false,
  strike: false,
  inlineCode: false,
  link: false,
  bulletList: false,
  orderedList: false,
  checklist: false,
  quote: false,
  heading: 0,
}

function lineAt(doc: string, pos: number): string {
  const start = doc.lastIndexOf('\n', pos - 1) + 1
  const end = doc.indexOf('\n', pos)
  return doc.slice(start, end === -1 ? doc.length : end)
}

function isWrappedBy(doc: string, from: number, to: number, marker: string): boolean {
  const selected = doc.slice(from, to)

  if (
    selected.length >= marker.length * 2 &&
    selected.startsWith(marker) &&
    selected.endsWith(marker)
  ) {
    return true
  }

  if (from >= marker.length && to + marker.length <= doc.length) {
    const before = doc.slice(from - marker.length, from)
    const after = doc.slice(to, to + marker.length)
    if (before === marker && after === marker) {
      if (marker === '*') {
        const left = from - marker.length - 1 >= 0 ? doc[from - marker.length - 1] : ''
        const right = to + marker.length < doc.length ? doc[to + marker.length] : ''
        if (left === '*' || right === '*') return false
      }
      return true
    }
  }

  // Caret or selection inside a marker pair on the same line
  const probe = from === to ? from : Math.floor((from + to) / 2)
  return isInsidePair(doc, probe, marker)
}

function isInsidePair(doc: string, caret: number, marker: string): boolean {
  const lineStart = doc.lastIndexOf('\n', caret - 1) + 1
  const lineEndIdx = doc.indexOf('\n', caret)
  const lineEnd = lineEndIdx === -1 ? doc.length : lineEndIdx
  const line = doc.slice(lineStart, lineEnd)
  const local = caret - lineStart

  if (marker === '**') {
    // Scan for ** pairs containing caret
    let i = 0
    while (i < line.length) {
      const open = line.indexOf('**', i)
      if (open < 0) break
      const close = line.indexOf('**', open + 2)
      if (close < 0) break
      if (local > open + 1 && local < close + 1) return true
      i = open + 2
    }
    return false
  }

  if (marker === '~~') {
    let i = 0
    while (i < line.length) {
      const open = line.indexOf('~~', i)
      if (open < 0) break
      const close = line.indexOf('~~', open + 2)
      if (close < 0) break
      if (local > open + 1 && local < close + 1) return true
      i = open + 2
    }
    return false
  }

  if (marker === '`') {
    let i = 0
    while (i < line.length) {
      const open = line.indexOf('`', i)
      if (open < 0) break
      const close = line.indexOf('`', open + 1)
      if (close < 0) break
      if (local > open && local <= close) return true
      i = close + 1
    }
    return false
  }

  if (marker === '*') {
    // Single-asterisk italic, skipping ** bold markers
    let i = 0
    while (i < line.length) {
      if (line[i] !== '*') {
        i += 1
        continue
      }
      if (line[i + 1] === '*') {
        i += 2
        continue
      }
      const open = i
      let j = i + 1
      while (j < line.length) {
        if (line[j] === '*' && line[j + 1] !== '*') break
        if (line[j] === '*' && line[j + 1] === '*') {
          j += 2
          continue
        }
        j += 1
      }
      if (j >= line.length || line[j] !== '*') break
      if (local > open && local <= j) return true
      i = j + 1
    }
  }

  return false
}

function isLinkContext(doc: string, from: number, to: number): boolean {
  const selected = doc.slice(from, to)
  if (/\[[^\]]*]\([^)]*\)/.test(selected)) return true
  const probe = from === to ? from : from
  const line = lineAt(doc, probe)
  const local = probe - (doc.lastIndexOf('\n', probe - 1) + 1)
  // crude: caret inside [label](url)
  const linkRe = /\[[^\]]*]\([^)]*\)/g
  for (const match of line.matchAll(linkRe)) {
    const start = match.index ?? 0
    const end = start + match[0].length
    if (local >= start && local <= end) return true
  }
  return false
}

export function detectActiveFormats(doc: string, from: number, to: number): ActiveFormats {
  if (!doc) return { ...EMPTY }

  const safeFrom = Math.max(0, Math.min(from, doc.length))
  const safeTo = Math.max(safeFrom, Math.min(to, doc.length))
  const line = lineAt(doc, safeFrom)

  const headingMatch = /^(#{1,6})\s+/.exec(line)
  const heading = (headingMatch ? headingMatch[1].length : 0) as ActiveFormats['heading']

  const checklist = /^(\s*)[-*+] \[[ xX]\]\s+/.test(line)
  const bulletList = !checklist && /^(\s*)[-*+]\s+/.test(line)
  const orderedList = /^(\s*)\d+\.\s+/.test(line)
  const quote = /^(\s*)>\s?/.test(line)

  return {
    bold: isWrappedBy(doc, safeFrom, safeTo, '**'),
    italic: isWrappedBy(doc, safeFrom, safeTo, '*'),
    strike: isWrappedBy(doc, safeFrom, safeTo, '~~'),
    inlineCode: isWrappedBy(doc, safeFrom, safeTo, '`'),
    link: isLinkContext(doc, safeFrom, safeTo),
    bulletList,
    orderedList,
    checklist,
    quote,
    heading,
  }
}

/** Toggle the Nth GFM task checkbox in source (`- [ ]` ↔ `- [x]`). */
export function toggleTaskAtIndex(source: string, index: number): string | null {
  let current = -1
  let replaced = false

  const next = source.replace(
    /^(\s*[-*+] )\[([ xX])\](.*)$/gm,
    (full, prefix: string, mark: string, rest: string) => {
      current += 1
      if (current !== index) return full
      replaced = true
      const checked = mark === 'x' || mark === 'X'
      return `${prefix}[${checked ? ' ' : 'x'}]${rest}`
    },
  )

  return replaced ? next : null
}
