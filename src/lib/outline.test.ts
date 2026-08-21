import { describe, expect, it } from 'vitest'
import { activeOutlineId, extractOutline } from '@/lib/markdown'

describe('extractOutline', () => {
  it('extracts nested headings with ids, lines, and offsets', () => {
    const source = `# Title\n\nIntro\n\n## Section\n\n### Detail\n`
    const outline = extractOutline(source)
    expect(outline).toEqual([
      { id: 'title', text: 'Title', level: 1, line: 1, from: 0 },
      { id: 'section', text: 'Section', level: 2, line: 5, from: 16 },
      { id: 'detail', text: 'Detail', level: 3, line: 7, from: 28 },
    ])
  })

  it('dedupes ids like rehype-slug', () => {
    const outline = extractOutline('# A\n# A\n')
    expect(outline.map((h) => h.id)).toEqual(['a', 'a-1'])
  })
})

describe('activeOutlineId', () => {
  it('returns the last heading at or before the caret', () => {
    const headings = extractOutline('# One\n\nbody\n\n## Two\n\nmore\n')
    expect(activeOutlineId(headings, 0)).toBe('one')
    expect(activeOutlineId(headings, 10)).toBe('one')
    expect(activeOutlineId(headings, headings[1].from)).toBe('two')
  })
})
