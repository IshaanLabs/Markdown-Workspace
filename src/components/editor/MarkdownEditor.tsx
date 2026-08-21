import { forwardRef, useImperativeHandle, useRef } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { Prec } from '@codemirror/state'
import { keymap, EditorView, type ViewUpdate } from '@codemirror/view'
import { workspaceEditorTheme, workspaceHighlight } from '@/styles/codemirror-theme'
import { editorCommands } from '@/components/editor/editorCommands'
import { detectActiveFormats, type ActiveFormats } from '@/lib/activeFormats'

export type MarkdownEditorHandle = {
  getView: () => EditorView | null
}

type MarkdownEditorProps = {
  value: string
  onChange: (value: string) => void
  onViewReady?: (view: EditorView | null) => void
  onActiveFormatsChange?: (formats: ActiveFormats) => void
}

function formatsFromUpdate(update: ViewUpdate): ActiveFormats {
  const { from, to } = update.state.selection.main
  return detectActiveFormats(update.state.doc.toString(), from, to)
}

export const MarkdownEditor = forwardRef<MarkdownEditorHandle, MarkdownEditorProps>(
  function MarkdownEditor({ value, onChange, onViewReady, onActiveFormatsChange }, ref) {
    const viewRef = useRef<EditorView | null>(null)

    useImperativeHandle(ref, () => ({
      getView: () => viewRef.current,
    }))

    return (
      <div className="cm-editor-host h-full min-h-0">
        <CodeMirror
          value={value}
          height="100%"
          theme="none"
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: true,
            highlightActiveLineGutter: true,
            bracketMatching: true,
            autocompletion: false,
            searchKeymap: true,
          }}
          extensions={[
            markdown({ base: markdownLanguage }),
            workspaceEditorTheme,
            workspaceHighlight,
            EditorView.lineWrapping,
            Prec.high(
              keymap.of([
                {
                  key: 'Mod-b',
                  run: (view) => {
                    editorCommands.bold(view)
                    return true
                  },
                },
                {
                  key: 'Mod-i',
                  run: (view) => {
                    editorCommands.italic(view)
                    return true
                  },
                },
                {
                  key: 'Mod-e',
                  run: (view) => {
                    editorCommands.inlineCode(view)
                    return true
                  },
                },
                {
                  key: 'Mod-k',
                  run: (view) => {
                    editorCommands.link(view)
                    return true
                  },
                },
              ]),
            ),
          ]}
          onCreateEditor={(view) => {
            viewRef.current = view
            onViewReady?.(view)
            const { from, to } = view.state.selection.main
            onActiveFormatsChange?.(detectActiveFormats(view.state.doc.toString(), from, to))
          }}
          onUpdate={(update) => {
            if (update.docChanged || update.selectionSet) {
              onActiveFormatsChange?.(formatsFromUpdate(update))
            }
          }}
          onChange={onChange}
          className="h-full"
        />
      </div>
    )
  },
)
