import { describe, expect, it } from 'vitest'
import { detectActiveFormats, toggleTaskAtIndex } from '@/lib/activeFormats'

describe('detectActiveFormats', () => {
  it('detects bold inside markers', () => {
    const doc = 'say **hello** now'
    const formats = detectActiveFormats(doc, 6, 11) // hello
    expect(formats.bold).toBe(true)
    expect(formats.italic).toBe(false)
  })

  it('detects italic without treating bold as italic', () => {
    const bold = detectActiveFormats('**hello**', 2, 7)
    expect(bold.bold).toBe(true)
    expect(bold.italic).toBe(false)

    const italic = detectActiveFormats('*hello*', 1, 6)
    expect(italic.italic).toBe(true)
    expect(italic.bold).toBe(false)
  })

  it('detects line formats', () => {
    expect(detectActiveFormats('- item', 2, 2).bulletList).toBe(true)
    expect(detectActiveFormats('1. item', 2, 2).orderedList).toBe(true)
    expect(detectActiveFormats('- [ ] task', 4, 4).checklist).toBe(true)
    expect(detectActiveFormats('> quote', 2, 2).quote).toBe(true)
    expect(detectActiveFormats('## Title', 3, 3).heading).toBe(2)
  })
})

describe('toggleTaskAtIndex', () => {
  it('checks and unchecks the targeted task', () => {
    const source = '- [ ] a\n- [x] b\n- [ ] c'
    const checked = toggleTaskAtIndex(source, 0)
    expect(checked).toBe('- [x] a\n- [x] b\n- [ ] c')
    const unchecked = toggleTaskAtIndex(checked!, 1)
    expect(unchecked).toBe('- [x] a\n- [ ] b\n- [ ] c')
  })
})
