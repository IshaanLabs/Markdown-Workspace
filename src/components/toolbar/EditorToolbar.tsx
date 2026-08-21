import type { EditorView } from '@codemirror/view'
import {
  Code,
  CodeBlock,
  ImageSquare,
  LinkSimple,
  ListBullets,
  ListChecks,
  ListNumbers,
  Minus,
  Quotes,
  Table,
  TextB,
  TextH,
  TextItalic,
  TextStrikethrough,
} from '@phosphor-icons/react'
import { editorCommands } from '@/components/editor/editorCommands'
import { ToolbarButton } from '@/components/ui/ToolbarButton'
import { ToolbarMenu, ToolbarMenuItem } from '@/components/ui/ToolbarMenu'
import type { ActiveFormats } from '@/lib/activeFormats'
import { cn } from '@/lib/cn'

type EditorToolbarProps = {
  view: EditorView | null
  active: ActiveFormats
  disabled?: boolean
  className?: string
}

function Divider() {
  return <div className="mx-0.5 h-5 w-px bg-white/8" aria-hidden />
}

export function EditorToolbar({
  view,
  active,
  disabled = false,
  className,
}: EditorToolbarProps) {
  const off = disabled || !view

  return (
    <div
      className={cn(
        'flex items-center gap-0.5 overflow-x-auto px-2 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
      role="toolbar"
      aria-label="Markdown formatting"
    >
      <ToolbarButton
        label="Bold"
        shortcut="Ctrl+B"
        disabled={off}
        active={active.bold}
        aria-pressed={active.bold}
        onClick={() => editorCommands.bold(view)}
      >
        <TextB size={16} weight="bold" aria-hidden />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        shortcut="Ctrl+I"
        disabled={off}
        active={active.italic}
        aria-pressed={active.italic}
        onClick={() => editorCommands.italic(view)}
      >
        <TextItalic size={16} weight="bold" aria-hidden />
      </ToolbarButton>
      <ToolbarButton
        label="Strikethrough"
        disabled={off}
        active={active.strike}
        aria-pressed={active.strike}
        onClick={() => editorCommands.strike(view)}
      >
        <TextStrikethrough size={16} weight="bold" aria-hidden />
      </ToolbarButton>

      <Divider />

      <ToolbarMenu
        label={active.heading ? `H${active.heading}` : 'Headings'}
        disabled={off}
        formatActive={active.heading > 0}
        icon={<TextH size={16} weight="bold" aria-hidden />}
      >
        {([1, 2, 3, 4, 5, 6] as const).map((level) => (
          <ToolbarMenuItem
            key={level}
            label={`Heading ${level}`}
            hint={`${'#'.repeat(level)}`}
            active={active.heading === level}
            onSelect={() => editorCommands.heading(view, level)}
          />
        ))}
      </ToolbarMenu>

      <Divider />

      <ToolbarButton
        label="Bulleted list"
        disabled={off}
        active={active.bulletList}
        aria-pressed={active.bulletList}
        onClick={() => editorCommands.bulletList(view)}
      >
        <ListBullets size={16} weight="bold" aria-hidden />
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        disabled={off}
        active={active.orderedList}
        aria-pressed={active.orderedList}
        onClick={() => editorCommands.orderedList(view)}
      >
        <ListNumbers size={16} weight="bold" aria-hidden />
      </ToolbarButton>
      <ToolbarButton
        label="Checklist"
        disabled={off}
        active={active.checklist}
        aria-pressed={active.checklist}
        onClick={() => editorCommands.checklist(view)}
      >
        <ListChecks size={16} weight="bold" aria-hidden />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Insert table"
        disabled={off}
        onClick={() => editorCommands.table(view)}
      >
        <Table size={16} weight="bold" aria-hidden />
      </ToolbarButton>
      <ToolbarButton
        label="Blockquote"
        disabled={off}
        active={active.quote}
        aria-pressed={active.quote}
        onClick={() => editorCommands.quote(view)}
      >
        <Quotes size={16} weight="bold" aria-hidden />
      </ToolbarButton>
      <ToolbarButton
        label="Inline code"
        disabled={off}
        active={active.inlineCode}
        aria-pressed={active.inlineCode}
        onClick={() => editorCommands.inlineCode(view)}
      >
        <Code size={16} weight="bold" aria-hidden />
      </ToolbarButton>
      <ToolbarButton
        label="Code block"
        disabled={off}
        onClick={() => editorCommands.codeBlock(view)}
      >
        <CodeBlock size={16} weight="bold" aria-hidden />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Link"
        disabled={off}
        active={active.link}
        aria-pressed={active.link}
        onClick={() => editorCommands.link(view)}
      >
        <LinkSimple size={16} weight="bold" aria-hidden />
      </ToolbarButton>
      <ToolbarButton label="Image" disabled={off} onClick={() => editorCommands.image(view)}>
        <ImageSquare size={16} weight="bold" aria-hidden />
      </ToolbarButton>
      <ToolbarButton
        label="Horizontal rule"
        disabled={off}
        onClick={() => editorCommands.hr(view)}
      >
        <Minus size={16} weight="bold" aria-hidden />
      </ToolbarButton>
    </div>
  )
}
