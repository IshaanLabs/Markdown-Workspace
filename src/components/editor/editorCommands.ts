import { EditorSelection, EditorState, type ChangeSpec, type TransactionSpec } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

/** Pure transform used by commands + unit tests. */
export function applyWrapToggle(
  doc: string,
  from: number,
  to: number,
  marker: string,
): { doc: string; from: number; to: number } {
  let rangeFrom = from
  let rangeTo = to

  // Empty caret: unwrap if already inside markers, else wrap the word under the caret.
  if (rangeFrom === rangeTo) {
    const unwrapped = unwrapAroundCaret(doc, rangeFrom, marker)
    if (unwrapped) return unwrapped

    const word = wordRangeAt(doc, rangeFrom)
    if (word) {
      rangeFrom = word.from
      rangeTo = word.to
    } else {
      // Insert empty markers with caret between them — never a fake "text" placeholder.
      const insert = `${marker}${marker}`
      const caret = rangeFrom + marker.length
      return {
        doc: doc.slice(0, rangeFrom) + insert + doc.slice(rangeTo),
        from: caret,
        to: caret,
      }
    }
  }

  const selected = doc.slice(rangeFrom, rangeTo)

  // Selection already includes the markers: **hello** → hello
  if (
    selected.length >= marker.length * 2 &&
    selected.startsWith(marker) &&
    selected.endsWith(marker)
  ) {
    const inner = selected.slice(marker.length, selected.length - marker.length)
    return {
      doc: doc.slice(0, rangeFrom) + inner + doc.slice(rangeTo),
      from: rangeFrom,
      to: rangeFrom + inner.length,
    }
  }

  // Markers immediately outside the selection
  if (rangeFrom >= marker.length && rangeTo + marker.length <= doc.length) {
    const before = doc.slice(rangeFrom - marker.length, rangeFrom)
    const after = doc.slice(rangeTo, rangeTo + marker.length)
    if (before === marker && after === marker && isSafeMarkerEdge(doc, rangeFrom, rangeTo, marker)) {
      const start = rangeFrom - marker.length
      const end = rangeTo + marker.length
      return {
        doc: doc.slice(0, start) + selected + doc.slice(end),
        from: start,
        to: start + selected.length,
      }
    }
  }

  // Wrap selection / expanded word
  const insert = `${marker}${selected}${marker}`
  return {
    doc: doc.slice(0, rangeFrom) + insert + doc.slice(rangeTo),
    from: rangeFrom + marker.length,
    to: rangeFrom + marker.length + selected.length,
  }
}

function wordRangeAt(doc: string, pos: number): { from: number; to: number } | null {
  const isWordChar = (ch: string | undefined) =>
    !!ch && /[\p{L}\p{N}_-]/u.test(ch)

  let start = pos
  let end = pos

  while (start > 0 && isWordChar(doc[start - 1])) start -= 1
  while (end < doc.length && isWordChar(doc[end])) end += 1

  if (start === end) return null
  // Don't wrap across markdown punctuation glued oddly
  return { from: start, to: end }
}

function isSafeMarkerEdge(doc: string, from: number, to: number, marker: string): boolean {
  // Avoid treating the inner * of **bold** as italic wrappers.
  if (marker !== '*') return true
  const left = from - marker.length - 1 >= 0 ? doc[from - marker.length - 1] : ''
  const right = to + marker.length < doc.length ? doc[to + marker.length] : ''
  return left !== '*' && right !== '*'
}

function unwrapAroundCaret(
  doc: string,
  caret: number,
  marker: string,
): { doc: string; from: number; to: number } | null {
  // Empty pair with caret between markers: **|**  or  *|*  or  ~~|~~
  if (
    caret >= marker.length &&
    caret + marker.length <= doc.length &&
    doc.slice(caret - marker.length, caret) === marker &&
    doc.slice(caret, caret + marker.length) === marker &&
    isSafeMarkerEdge(doc, caret, caret, marker)
  ) {
    const start = caret - marker.length
    return {
      doc: doc.slice(0, start) + doc.slice(caret + marker.length),
      from: start,
      to: start,
    }
  }

  const left = doc.lastIndexOf(marker, Math.max(0, caret - 1))
  if (left < 0) return null
  const right = doc.indexOf(marker, caret)
  if (right < 0) return null
  if (left + marker.length > caret) return null
  if (right < caret) return null

  const inner = doc.slice(left + marker.length, right)
  if (inner.includes('\n')) return null
  if (marker === '*' && !isSafeMarkerEdge(doc, left + marker.length, right, marker)) return null
  if (marker === '*' && left > 0 && doc[left - 1] === '*') return null
  if (marker === '*' && right + 1 < doc.length && doc[right + 1] === '*') return null

  if (caret < left + marker.length || caret > right) return null

  return {
    doc: doc.slice(0, left) + inner + doc.slice(right + marker.length),
    from: left,
    to: left + inner.length,
  }
}

const LIST_PREFIX_RE = /^(?:[-*+] \[[ xX]\] |[-*+] |\d+\. |> )/

export function applyLinePrefixToggle(
  doc: string,
  from: number,
  to: number,
  kind: 'bullet' | 'ordered' | 'check' | 'quote',
): { doc: string; from: number; to: number } {
  const lines = doc.split('\n')
  // Map absolute offsets to line indices
  let offset = 0
  let startLine = 0
  let endLine = 0
  for (let i = 0; i < lines.length; i++) {
    const lineStart = offset
    const lineEnd = offset + lines[i].length
    if (from >= lineStart && from <= lineEnd + (i < lines.length - 1 ? 1 : 0)) startLine = i
    if (to >= lineStart && to <= lineEnd + (i < lines.length - 1 ? 1 : 0)) endLine = i
    offset = lineEnd + 1
  }
  // Clamp
  startLine = Math.max(0, Math.min(startLine, lines.length - 1))
  endLine = Math.max(startLine, Math.min(endLine, lines.length - 1))

  const targetPrefix = (index: number) => {
    switch (kind) {
      case 'bullet':
        return '- '
      case 'ordered':
        return `${index - startLine + 1}. `
      case 'check':
        return '- [ ] '
      case 'quote':
        return '> '
    }
  }

  const isSameKind = (line: string, index: number) => {
    const expected = targetPrefix(index)
    if (kind === 'ordered') return /^\d+\. /.test(line)
    return line.startsWith(expected)
  }

  const allSame = (() => {
    for (let i = startLine; i <= endLine; i++) {
      if (!isSameKind(lines[i], i)) return false
    }
    return true
  })()

  for (let i = startLine; i <= endLine; i++) {
    const line = lines[i]
    const cleaned = line.replace(LIST_PREFIX_RE, '')
    if (allSame) {
      lines[i] = cleaned
    } else {
      const prefix = targetPrefix(i)
      lines[i] = `${prefix}${cleaned}`
    }
  }

  // Ensure a blank line before the list block so CommonMark always parses lists
  if (!allSame && kind !== 'quote' && startLine > 0) {
    const prev = lines[startLine - 1]
    if (prev.trim() !== '' && !LIST_PREFIX_RE.test(prev)) {
      lines.splice(startLine, 0, '')
      endLine += 1
      startLine += 1
    }
  }

  const nextDoc = lines.join('\n')
  // Place caret at end of last affected content line
  let newFrom = 0
  for (let i = 0; i < startLine; i++) newFrom += lines[i].length + 1
  let newTo = newFrom
  for (let i = startLine; i <= endLine; i++) {
    newTo = newFrom
    for (let j = startLine; j < i; j++) newTo += lines[j].length + 1
    newTo += lines[i].length
  }
  // selection spanning the block
  let blockStart = 0
  for (let i = 0; i < startLine; i++) blockStart += lines[i].length + 1
  let blockEnd = blockStart
  for (let i = startLine; i <= endLine; i++) {
    blockEnd += lines[i].length
    if (i < endLine) blockEnd += 1
  }

  return { doc: nextDoc, from: blockStart, to: blockEnd }
}

export function applyHeading(
  doc: string,
  from: number,
  to: number,
  level: 1 | 2 | 3 | 4 | 5 | 6,
): { doc: string; from: number; to: number } {
  const marks = `${'#'.repeat(level)} `
  const lines = doc.split('\n')
  let offset = 0
  let startLine = 0
  let endLine = 0
  for (let i = 0; i < lines.length; i++) {
    const lineStart = offset
    const lineEnd = offset + lines[i].length
    if (from >= lineStart && from <= lineEnd + (i < lines.length - 1 ? 1 : 0)) startLine = i
    if (to >= lineStart && to <= lineEnd + (i < lines.length - 1 ? 1 : 0)) endLine = i
    offset = lineEnd + 1
  }

  const allSameLevel = (() => {
    for (let i = startLine; i <= endLine; i++) {
      if (!new RegExp(`^#{${level}}\\s+`).test(lines[i])) return false
    }
    return true
  })()

  for (let i = startLine; i <= endLine; i++) {
    const cleaned = lines[i].replace(/^#{1,6}\s+/, '').replace(LIST_PREFIX_RE, '')
    // Toggle off same heading level; never insert a fake "Heading" word.
    lines[i] = allSameLevel ? cleaned : `${marks}${cleaned}`
  }

  const nextDoc = lines.join('\n')
  let blockStart = 0
  for (let i = 0; i < startLine; i++) blockStart += lines[i].length + 1
  let blockEnd = blockStart
  for (let i = startLine; i <= endLine; i++) {
    blockEnd += lines[i].length
    if (i < endLine) blockEnd += 1
  }

  // Place caret after the heading marks when we just applied them on an empty line
  if (!allSameLevel && startLine === endLine && lines[startLine] === marks) {
    return { doc: nextDoc, from: blockStart + marks.length, to: blockStart + marks.length }
  }

  return { doc: nextDoc, from: blockStart, to: blockEnd }
}

export function applyLinkToggle(
  doc: string,
  from: number,
  to: number,
): { doc: string; from: number; to: number } {
  const selected = doc.slice(from, to)
  const wrapped = selected.match(/^\[([^\]]*)]\(([^)]*)\)$/)
  if (wrapped) {
    return {
      doc: doc.slice(0, from) + wrapped[1] + doc.slice(to),
      from,
      to: from + wrapped[1].length,
    }
  }

  let labelFrom = from
  let labelTo = to
  if (from === to) {
    const word = wordRangeAt(doc, from)
    if (word) {
      labelFrom = word.from
      labelTo = word.to
    }
  }

  const label = doc.slice(labelFrom, labelTo) || 'label'
  const insert = `[${label}](url)`
  // Select the url placeholder so the user can replace it immediately.
  const urlStart = labelFrom + 1 + label.length + 2
  return {
    doc: doc.slice(0, labelFrom) + insert + doc.slice(labelTo),
    from: urlStart,
    to: urlStart + 3,
  }
}

export function applyImageInsert(
  doc: string,
  from: number,
  to: number,
): { doc: string; from: number; to: number } {
  const selected = doc.slice(from, to)
  const wrapped = selected.match(/^!\[([^\]]*)]\(([^)]*)\)$/)
  if (wrapped) {
    return {
      doc: doc.slice(0, from) + wrapped[1] + doc.slice(to),
      from,
      to: from + wrapped[1].length,
    }
  }

  let altFrom = from
  let altTo = to
  if (from === to) {
    const word = wordRangeAt(doc, from)
    if (word) {
      altFrom = word.from
      altTo = word.to
    }
  }

  const alt = doc.slice(altFrom, altTo) || 'alt'
  const insert = `![${alt}](url)`
  // Select the url placeholder so the user can replace it immediately.
  const urlStart = altFrom + 2 + alt.length + 2
  return {
    doc: doc.slice(0, altFrom) + insert + doc.slice(altTo),
    from: urlStart,
    to: urlStart + 3,
  }
}

export function applyCodeBlockInsert(
  doc: string,
  from: number,
  to: number,
): { doc: string; from: number; to: number } {
  const selected = doc.slice(from, to)
  // Toggle off a selected fenced block
  const fenced = selected.match(/^```[^\n]*\n([\s\S]*?)\n```$/)
  if (fenced) {
    return {
      doc: doc.slice(0, from) + fenced[1] + doc.slice(to),
      from,
      to: from + fenced[1].length,
    }
  }

  const body = selected
  const insert = body ? `\`\`\`\n${body}\n\`\`\`` : '```\n\n```'
  const caret = from + 4 // after opening ```\n
  return {
    doc: doc.slice(0, from) + insert + doc.slice(to),
    from: caret,
    to: body ? caret + body.length : caret,
  }
}

const EMPTY_TABLE = `|  |  |  |
| --- | --- | --- |
|  |  |  |
`

export function applyTableInsert(
  doc: string,
  from: number,
  to: number,
): { doc: string; from: number; to: number } {
  // Prefer inserting after the current line when mid-content
  const lineStart = doc.lastIndexOf('\n', from - 1) + 1
  const lineEndIdx = doc.indexOf('\n', from)
  const lineEnd = lineEndIdx === -1 ? doc.length : lineEndIdx
  const line = doc.slice(lineStart, lineEnd)
  const atLineStart = from === lineStart && from === to

  let insertAt = from
  let prefix = ''
  if (!atLineStart && line.trim().length > 0 && from === to) {
    insertAt = lineEnd
    prefix = '\n\n'
  } else if (from !== to) {
    insertAt = from
    prefix = ''
  }

  const insert = `${prefix}${EMPTY_TABLE}`
  // Caret in the first header cell (after "| ")
  const caret = insertAt + prefix.length + 2
  return {
    doc: doc.slice(0, insertAt) + insert + doc.slice(to === from ? insertAt : to),
    from: caret,
    to: caret,
  }
}

function dispatchReplace(
  view: EditorView,
  next: { doc: string; from: number; to: number },
) {
  const spec: TransactionSpec = {
    changes: { from: 0, to: view.state.doc.length, insert: next.doc },
    selection: EditorSelection.range(next.from, next.to),
    userEvent: 'input',
  }
  view.dispatch(spec)
}

function run(view: EditorView | null, fn: (view: EditorView) => void) {
  if (!view) return
  fn(view)
  view.focus()
}

function wrapCommand(view: EditorView, marker: string) {
  const range = view.state.selection.main
  const doc = view.state.doc.toString()
  const next = applyWrapToggle(doc, range.from, range.to, marker)
  if (next.doc === doc && next.from === range.from && next.to === range.to) return
  const changes: ChangeSpec = { from: 0, to: doc.length, insert: next.doc }
  view.dispatch({
    changes,
    selection: EditorSelection.range(next.from, next.to),
    userEvent: 'input',
  })
}

function lineCommand(
  view: EditorView,
  kind: 'bullet' | 'ordered' | 'check' | 'quote',
) {
  const range = view.state.selection.main
  const doc = view.state.doc.toString()
  const next = applyLinePrefixToggle(doc, range.from, range.to, kind)
  dispatchReplace(view, next)
}

function insertBlock(view: EditorView, block: string) {
  const { state } = view
  const range = state.selection.main
  const line = state.doc.lineAt(range.head)
  const atLineStart = range.from === line.from && range.empty
  const lineHasContent = line.text.trim().length > 0

  let from = range.from
  let to = range.to
  let insert = block

  if (!range.empty) {
    insert = block
  } else if (!atLineStart && lineHasContent) {
    from = line.to
    to = line.to
    insert = `\n\n${block}`
  } else if (atLineStart && lineHasContent) {
    insert = `${block}\n`
  } else if (line.number > 1) {
    const prev = state.doc.line(line.number - 1)
    if (prev.text.trim() !== '') {
      insert = `\n${block}`
    }
  }

  const cursor = from + insert.length
  view.dispatch({
    changes: { from, to, insert },
    selection: EditorSelection.cursor(cursor),
    userEvent: 'input',
  })
}

export const editorCommands = {
  bold: (view: EditorView | null) => run(view, (v) => wrapCommand(v, '**')),
  italic: (view: EditorView | null) => run(view, (v) => wrapCommand(v, '*')),
  strike: (view: EditorView | null) => run(view, (v) => wrapCommand(v, '~~')),
  inlineCode: (view: EditorView | null) => run(view, (v) => wrapCommand(v, '`')),
  heading: (view: EditorView | null, level: 1 | 2 | 3 | 4 | 5 | 6) =>
    run(view, (v) => {
      const range = v.state.selection.main
      const next = applyHeading(v.state.doc.toString(), range.from, range.to, level)
      dispatchReplace(v, next)
    }),
  bulletList: (view: EditorView | null) => run(view, (v) => lineCommand(v, 'bullet')),
  orderedList: (view: EditorView | null) => run(view, (v) => lineCommand(v, 'ordered')),
  checklist: (view: EditorView | null) => run(view, (v) => lineCommand(v, 'check')),
  quote: (view: EditorView | null) => run(view, (v) => lineCommand(v, 'quote')),
  codeBlock: (view: EditorView | null) =>
    run(view, (v) => {
      const range = v.state.selection.main
      const next = applyCodeBlockInsert(v.state.doc.toString(), range.from, range.to)
      dispatchReplace(v, next)
    }),
  link: (view: EditorView | null) =>
    run(view, (v) => {
      const range = v.state.selection.main
      const next = applyLinkToggle(v.state.doc.toString(), range.from, range.to)
      dispatchReplace(v, next)
    }),
  image: (view: EditorView | null) =>
    run(view, (v) => {
      const range = v.state.selection.main
      const next = applyImageInsert(v.state.doc.toString(), range.from, range.to)
      dispatchReplace(v, next)
    }),
  table: (view: EditorView | null) =>
    run(view, (v) => {
      const range = v.state.selection.main
      const next = applyTableInsert(v.state.doc.toString(), range.from, range.to)
      dispatchReplace(v, next)
    }),
  hr: (view: EditorView | null) => run(view, (v) => insertBlock(v, `---\n`)),
}

/** Test helper: create an EditorView-backed doc in memory (jsdom/browser). */
export function createTestState(doc: string, from = 0, to = from) {
  return EditorState.create({
    doc,
    selection: EditorSelection.range(from, to),
  })
}
