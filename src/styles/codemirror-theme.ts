import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

export const workspaceEditorTheme = EditorView.theme(
  {
    '&': {
      color: '#E2E8F0',
      backgroundColor: 'transparent',
      height: '100%',
    },
    '.cm-content': {
      caretColor: '#2DD4BF',
      padding: '1.25rem 1rem 2rem',
      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
      fontSize: '14px',
      lineHeight: '1.65',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: '#2DD4BF',
      borderLeftWidth: '2px',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
      {
        backgroundColor: 'color-mix(in oklab, #2DD4BF 28%, transparent)',
      },
    '.cm-activeLine': {
      backgroundColor: 'color-mix(in oklab, white 3.5%, transparent)',
    },
    '.cm-gutters': {
      backgroundColor: 'transparent',
      color: '#64748B',
      border: 'none',
      borderRight: '1px solid color-mix(in oklab, white 6%, transparent)',
      minWidth: '3rem',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'color-mix(in oklab, white 4%, transparent)',
      color: '#94A3B8',
    },
    '.cm-lineNumbers .cm-gutterElement': {
      padding: '0 0.75rem 0 0.5rem',
      minWidth: '2.4rem',
    },
    '.cm-foldPlaceholder': {
      backgroundColor: '#1C2533',
      border: 'none',
      color: '#94A3B8',
    },
    '.cm-tooltip': {
      backgroundColor: '#151C26',
      border: '1px solid color-mix(in oklab, white 8%, transparent)',
      color: '#E2E8F0',
    },
    '.cm-panels': {
      backgroundColor: '#10161E',
      color: '#E2E8F0',
    },
  },
  { dark: true },
)

const highlightStyle = HighlightStyle.define([
  { tag: t.heading, color: '#F8FAFC', fontWeight: '600' },
  { tag: t.heading1, color: '#F8FAFC', fontWeight: '700' },
  { tag: t.heading2, color: '#F1F5F9', fontWeight: '600' },
  { tag: t.heading3, color: '#E2E8F0', fontWeight: '600' },
  { tag: t.strong, color: '#F8FAFC', fontWeight: '700' },
  { tag: t.emphasis, color: '#CBD5E1', fontStyle: 'italic' },
  { tag: t.strikethrough, textDecoration: 'line-through', color: '#94A3B8' },
  { tag: t.link, color: '#5EEAD4' },
  { tag: t.url, color: '#2DD4BF' },
  { tag: t.quote, color: '#94A3B8', fontStyle: 'italic' },
  { tag: t.list, color: '#94A3B8' },
  { tag: t.atom, color: '#5EEAD4' },
  { tag: t.bool, color: '#5EEAD4' },
  { tag: t.number, color: '#FBBF24' },
  { tag: t.keyword, color: '#38BDF8' },
  { tag: t.string, color: '#86EFAC' },
  { tag: t.comment, color: '#64748B', fontStyle: 'italic' },
  { tag: t.meta, color: '#94A3B8' },
  { tag: t.monospace, color: '#A5F3FC' },
  { tag: t.contentSeparator, color: '#475569' },
  { tag: t.processingInstruction, color: '#94A3B8' },
  { tag: t.punctuation, color: '#94A3B8' },
])

export const workspaceHighlight = syntaxHighlighting(highlightStyle)
