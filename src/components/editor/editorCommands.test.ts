import { describe, expect, it } from 'vitest'
import {
  applyCodeBlockInsert,
  applyHeading,
  applyImageInsert,
  applyLinePrefixToggle,
  applyLinkToggle,
  applyTableInsert,
  applyWrapToggle,
} from './editorCommands'
import { renderMarkdown } from '@/lib/markdown'

describe('applyWrapToggle', () => {
  it('wraps a selection in bold', () => {
    const next = applyWrapToggle('hello', 0, 5, '**')
    expect(next.doc).toBe('**hello**')
    expect(next.from).toBe(2)
    expect(next.to).toBe(7)
  })

  it('unwraps when selection includes markers', () => {
    const next = applyWrapToggle('**hello**', 0, 9, '**')
    expect(next.doc).toBe('hello')
  })

  it('unwraps when selection is inside markers (second bold press)', () => {
    const next = applyWrapToggle('**hello**', 2, 7, '**')
    expect(next.doc).toBe('hello')
    expect(next.from).toBe(0)
    expect(next.to).toBe(5)
  })

  it('does not double-wrap on repeated bold', () => {
    let doc = 'hello'
    let from = 0
    let to = 5
    ;({ doc, from, to } = applyWrapToggle(doc, from, to, '**'))
    ;({ doc, from, to } = applyWrapToggle(doc, from, to, '**'))
    expect(doc).toBe('hello')
  })

  it('inserts empty markers (not a text placeholder) then unwraps', () => {
    let next = applyWrapToggle('', 0, 0, '**')
    expect(next.doc).toBe('****')
    expect(next.from).toBe(2)
    expect(next.to).toBe(2)
    next = applyWrapToggle(next.doc, next.from, next.to, '**')
    expect(next.doc).toBe('')
  })

  it('wraps the word under the caret when nothing is selected', () => {
    const next = applyWrapToggle('hello world', 2, 2, '**')
    expect(next.doc).toBe('**hello** world')
  })

  it('does not insert a literal text placeholder mid-paragraph', () => {
    const next = applyWrapToggle('Most Markdown tools', 0, 0, '**')
    expect(next.doc).toBe('**Most** Markdown tools')
    expect(next.doc).not.toContain('**text**')
  })

  it('toggles italic the same way — wraps word, no placeholder', () => {
    const next = applyWrapToggle('Most Markdown tools', 0, 0, '*')
    expect(next.doc).toBe('*Most* Markdown tools')
    expect(next.doc).not.toContain('*text*')
  })

  it('italic empty markers toggle off', () => {
    let next = applyWrapToggle('hello ', 6, 6, '*')
    expect(next.doc).toBe('hello **')
    next = applyWrapToggle(next.doc, next.from, next.to, '*')
    expect(next.doc).toBe('hello ')
  })

  it('does not treat bold markers as italic when selecting inner text', () => {
    const bold = applyWrapToggle('hello', 0, 5, '**')
    expect(bold.doc).toBe('**hello**')
    const italicAttempt = applyWrapToggle(bold.doc, 2, 7, '*')
    expect(italicAttempt.doc).toBe('***hello***')
  })

  it('toggles strikethrough', () => {
    let next = applyWrapToggle('gone', 0, 4, '~~')
    expect(next.doc).toBe('~~gone~~')
    next = applyWrapToggle(next.doc, next.from, next.to, '~~')
    expect(next.doc).toBe('gone')
  })

  it('strikethrough wraps word under caret with no placeholder', () => {
    const next = applyWrapToggle('gone forever', 2, 2, '~~')
    expect(next.doc).toBe('~~gone~~ forever')
  })

  it('toggles inline code', () => {
    let next = applyWrapToggle('x', 0, 1, '`')
    expect(next.doc).toBe('`x`')
    next = applyWrapToggle(next.doc, next.from, next.to, '`')
    expect(next.doc).toBe('x')
  })

  it('inline code inserts empty backticks, not a code placeholder', () => {
    let next = applyWrapToggle('hi ', 3, 3, '`')
    expect(next.doc).toBe('hi ``')
    next = applyWrapToggle(next.doc, next.from, next.to, '`')
    expect(next.doc).toBe('hi ')
  })
})

describe('applyLinePrefixToggle', () => {
  it('adds and removes bullet prefixes', () => {
    let next = applyLinePrefixToggle('hello', 0, 5, 'bullet')
    expect(next.doc).toBe('- hello')
    next = applyLinePrefixToggle(next.doc, next.from, next.to, 'bullet')
    expect(next.doc).toBe('hello')
  })

  it('empty line gets prefix only — no item placeholder', () => {
    const next = applyLinePrefixToggle('', 0, 0, 'bullet')
    expect(next.doc).toBe('- ')
    expect(next.doc).not.toContain('item')
  })

  it('inserts a blank line before bullets so preview parses lists', () => {
    const next = applyLinePrefixToggle('Title\nitem', 6, 10, 'bullet')
    expect(next.doc).toBe('Title\n\n- item')
  })

  it('creates ordered lists with incrementing numbers', () => {
    const next = applyLinePrefixToggle('a\nb\nc', 0, 5, 'ordered')
    expect(next.doc).toBe('1. a\n2. b\n3. c')
  })

  it('toggles checklist', () => {
    let next = applyLinePrefixToggle('task', 0, 4, 'check')
    expect(next.doc).toBe('- [ ] task')
    next = applyLinePrefixToggle(next.doc, next.from, next.to, 'check')
    expect(next.doc).toBe('task')
  })

  it('toggles blockquote', () => {
    let next = applyLinePrefixToggle('quote', 0, 5, 'quote')
    expect(next.doc).toBe('> quote')
    next = applyLinePrefixToggle(next.doc, next.from, next.to, 'quote')
    expect(next.doc).toBe('quote')
  })

  it('switches bullet to ordered', () => {
    const next = applyLinePrefixToggle('- hello', 0, 7, 'ordered')
    expect(next.doc).toBe('1. hello')
  })
})

describe('applyHeading', () => {
  it('sets and replaces heading levels', () => {
    let next = applyHeading('Hello', 0, 5, 1)
    expect(next.doc).toBe('# Hello')
    next = applyHeading(next.doc, next.from, next.to, 3)
    expect(next.doc).toBe('### Hello')
  })

  it('toggles the same heading level off and never inserts Heading', () => {
    let next = applyHeading('Hello', 0, 5, 2)
    expect(next.doc).toBe('## Hello')
    next = applyHeading(next.doc, next.from, next.to, 2)
    expect(next.doc).toBe('Hello')

    const empty = applyHeading('', 0, 0, 1)
    expect(empty.doc).toBe('# ')
    expect(empty.doc).not.toContain('Heading')
  })
})

describe('link / image / code block / table — placeholders only for link & image', () => {
  it('link keeps label/url placeholders when empty', () => {
    const next = applyLinkToggle('', 0, 0)
    expect(next.doc).toBe('[label](url)')
    expect(next.from).toBe(8)
    expect(next.to).toBe(11)
  })

  it('link wraps the word under the caret and selects url', () => {
    const next = applyLinkToggle('docs here', 0, 0)
    expect(next.doc).toBe('[docs](url) here')
  })

  it('link toggles off when the full markdown link is selected', () => {
    const next = applyLinkToggle('[docs](https://x.com)', 0, 21)
    expect(next.doc).toBe('docs')
  })

  it('image keeps alt/url placeholders when empty', () => {
    const next = applyImageInsert('', 0, 0)
    expect(next.doc).toBe('![alt](url)')
    expect(next.from).toBe(7)
    expect(next.to).toBe(10)
  })

  it('image wraps the word under the caret as alt text', () => {
    const next = applyImageInsert('logo here', 0, 0)
    expect(next.doc).toBe('![logo](url) here')
  })

  it('code block inserts empty fence, not a code placeholder', () => {
    const next = applyCodeBlockInsert('', 0, 0)
    expect(next.doc).toBe('```\n\n```')
    expect(next.doc).not.toMatch(/```\ncode\n```/)
  })

  it('table inserts empty cells without Column/Cell labels', () => {
    const next = applyTableInsert('', 0, 0)
    expect(next.doc).toContain('|  |  |  |')
    expect(next.doc).not.toContain('Column')
    expect(next.doc).not.toContain('Cell')
  })
})

describe('preview renders toolbar output', () => {
  it('renders bold', async () => {
    const html = await renderMarkdown('**hello**')
    expect(html).toContain('<strong>hello</strong>')
  })

  it('renders italic', async () => {
    const html = await renderMarkdown('*hello*')
    expect(html).toContain('<em>hello</em>')
  })

  it('renders strikethrough', async () => {
    const html = await renderMarkdown('~~hello~~')
    expect(html).toContain('<del>hello</del>')
  })

  it('renders bullet lists', async () => {
    const html = await renderMarkdown('Title\n\n- item')
    expect(html).toContain('<ul>')
    expect(html).toContain('<li>item</li>')
  })

  it('renders ordered lists', async () => {
    const html = await renderMarkdown('1. a\n2. b')
    expect(html).toContain('<ol>')
    expect(html).toContain('<li>a</li>')
  })

  it('renders checklists', async () => {
    const html = await renderMarkdown('- [ ] task')
    expect(html).toContain('checkbox')
    expect(html).toContain('task')
    expect(html).not.toMatch(/disabled/)
  })

  it('renders blockquote', async () => {
    const html = await renderMarkdown('> hi')
    expect(html).toContain('<blockquote>')
  })

  it('renders code block', async () => {
    const html = await renderMarkdown('```\ncode\n```')
    expect(html).toContain('<pre>')
    expect(html).toContain('code')
  })

  it('renders link', async () => {
    const html = await renderMarkdown('[label](https://example.com)')
    expect(html).toContain('<a href="https://example.com">label</a>')
  })

  it('renders image', async () => {
    const html = await renderMarkdown('![alt](https://example.com/a.png)')
    expect(html).toContain('<img')
    expect(html).toContain('alt')
  })

  it('renders table', async () => {
    const html = await renderMarkdown(
      '| A | B |\n| --- | --- |\n| 1 | 2 |',
    )
    expect(html).toContain('<table>')
    expect(html).toContain('<th>A</th>')
  })

  it('renders horizontal rule', async () => {
    const html = await renderMarkdown('---')
    expect(html).toContain('<hr>')
  })

  it('renders headings', async () => {
    const html = await renderMarkdown('## Hello')
    expect(html).toContain('<h2')
    expect(html).toContain('Hello')
  })
})
